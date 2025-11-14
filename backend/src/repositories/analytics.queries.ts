/**
 * Analytics Queries
 *
 * Pure database query functions for property sales analytics.
 * These functions contain no HTTP/handler logic - just Drizzle queries.
 *
 * Key principles:
 * 1. Aggregate in the database (let PostgreSQL do the heavy lifting)
 * 2. Compute ratios AFTER aggregation (weighted averages)
 * 3. Return type-safe results
 * 4. Reusable filter building logic
 */

import type {
  AnalyticsQueryParams,
  PricePerM2Deciles,
  SalesByInseeCode,
  SalesByInseeCodeAndSection,
  SalesByMonth,
  SalesByPropertyType,
  SalesByYear,
  SalesSummary,
} from "@app/shared";
import { and, between, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { propertySales } from "@/db/schema";
import {
  MIN_RESIDENTIAL_AREA,
  MAX_RESIDENTIAL_AREA,
  MIN_RESIDENTIAL_PRICE,
  MAX_RESIDENTIAL_PRICE,
  MIN_APARTMENT_AREA,
  MAX_APARTMENT_AREA,
  MIN_APARTMENT_PRICE,
  MAX_APARTMENT_PRICE,
  MIN_HOUSE_AREA,
  MAX_HOUSE_AREA,
  MIN_HOUSE_PRICE,
  MAX_HOUSE_PRICE,
} from "./constants";

// ============================================================================
// Shared Utilities
// ============================================================================

/**
 * Build WHERE clause from query parameters
 * Reusable across all analytics queries
 */
function buildWhereClause(filters: Partial<AnalyticsQueryParams>) {
  const conditions = [];

  // Time filters - year
  if (filters.year) {
    conditions.push(eq(propertySales.year, filters.year));
  }

  // Time filters - year range
  if (filters.startYear && filters.endYear) {
    conditions.push(
      between(propertySales.year, filters.startYear, filters.endYear)
    );
  } else {
    if (filters.startYear) {
      conditions.push(gte(propertySales.year, filters.startYear));
    }
    if (filters.endYear) {
      conditions.push(lte(propertySales.year, filters.endYear));
    }
  }

  // Time filters - date range
  if (filters.startDate) {
    conditions.push(gte(propertySales.date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(propertySales.date, filters.endDate));
  }

  // Location filters
  if (filters.depCode) {
    conditions.push(eq(propertySales.depCode, filters.depCode));
  }

  if (filters.inseeCode) {
    // Use primaryInseeCode for fast indexed filtering
    conditions.push(eq(propertySales.primaryInseeCode, filters.inseeCode));
  }

  if (filters.section) {
    // Use primarySection for fast indexed filtering
    conditions.push(eq(propertySales.primarySection, filters.section));
  }

  // Property type filters
  if (filters.propertyTypeCode) {
    conditions.push(
      eq(propertySales.propertyTypeCode, filters.propertyTypeCode)
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Build ORDER BY clause from query parameters
 */
function buildOrderByClause(params: Partial<AnalyticsQueryParams>) {
  const { sortBy, sortOrder = "desc" } = params;

  if (!sortBy) {
    return sql`count(*) desc`; // Default: sort by count descending
  }

  const direction = sortOrder === "asc" ? sql`asc` : sql`desc`;

  switch (sortBy) {
    case "count":
      return sql`count(*) ${direction}`;
    case "totalPrice":
      return sql`sum(${propertySales.price}) ${direction}`;
    case "avgPrice":
      return sql`avg(${propertySales.price}) ${direction}`;
    case "avgPricePerM2":
      return sql`(sum(${propertySales.price}) / nullif(sum(${propertySales.floorArea}), 0)) ${direction}`;
    case "totalFloorArea":
      return sql`sum(${propertySales.floorArea}) ${direction}`;
    default:
      return sql`count(*) desc`;
  }
}

/**
 * Base aggregation fields used across all analytics queries
 * These represent the core metrics computed for each group
 */
const baseAggregationFields = {
  // Transaction count
  count: sql<number>`count(*)::int`,

  // Price aggregates (in euros) - rounded to nearest euro
  totalPrice: sql<number>`coalesce(round(sum(${propertySales.price})), 0)::double precision`,
  avgPrice: sql<number>`coalesce(round(avg(${propertySales.price})), 0)::double precision`,
  minPrice: sql<number>`coalesce(round(min(${propertySales.price})), 0)::double precision`,
  maxPrice: sql<number>`coalesce(round(max(${propertySales.price})), 0)::double precision`,

  // Floor area aggregates (in m²) - rounded to 1 decimal place
  totalFloorArea: sql<number>`coalesce(round(sum(${propertySales.floorArea}), 1), 0)::double precision`,
  avgFloorArea: sql<number>`coalesce(round(avg(${propertySales.floorArea}), 1), 0)::double precision`,

  // Computed metric: Average price per m² (AFTER aggregation - weighted average)
  // This is the CORRECT way: SUM(price) / SUM(floorArea)
  // NOT: AVG(price / floorArea) which would be wrong
  // Rounded to nearest euro per m²
  // Filter to main property types only (apartments and houses) and exclude outliers
  avgPricePerM2: sql<number | null>`
    case
      when sum(${propertySales.floorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE', 'UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
        AND ${propertySales.floorArea} >= ${MIN_RESIDENTIAL_AREA} AND ${propertySales.floorArea} <= ${MAX_RESIDENTIAL_AREA}
        AND ${propertySales.price} >= ${MIN_RESIDENTIAL_PRICE} AND ${propertySales.price} <= ${MAX_RESIDENTIAL_PRICE}
      ) > 0
      then round(sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE', 'UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
        AND ${propertySales.floorArea} >= ${MIN_RESIDENTIAL_AREA} AND ${propertySales.floorArea} <= ${MAX_RESIDENTIAL_AREA}
        AND ${propertySales.price} >= ${MIN_RESIDENTIAL_PRICE} AND ${propertySales.price} <= ${MAX_RESIDENTIAL_PRICE}
      ) / sum(${propertySales.floorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE', 'UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
        AND ${propertySales.floorArea} >= ${MIN_RESIDENTIAL_AREA} AND ${propertySales.floorArea} <= ${MAX_RESIDENTIAL_AREA}
        AND ${propertySales.price} >= ${MIN_RESIDENTIAL_PRICE} AND ${propertySales.price} <= ${MAX_RESIDENTIAL_PRICE}
      ))::double precision
      else null
    end
  `,
};

/**
 * Property type breakdown fields
 * Total counts of different property types sold
 */
const propertyTypeFields = {
  totalProperties: sql<number>`coalesce(sum(${propertySales.nbProperties}), 0)::int`,
  totalApartments: sql<number>`coalesce(sum(${propertySales.nbApartments}), 0)::int`,
  totalHouses: sql<number>`coalesce(sum(${propertySales.nbHouses}), 0)::int`,
  totalWorkspaces: sql<number>`coalesce(sum(${propertySales.nbWorkspaces}), 0)::int`,
  totalSecondaryUnits: sql<number>`coalesce(sum(${propertySales.nbSecondaryUnits}), 0)::int`,
};

/**
 * Apartment-specific aggregation fields using FILTER
 * Filters to pure apartment transactions for accurate price/m² calculations
 */
const apartmentSpecificFields = {
  apartmentTransactionCount: sql<number>`
    count(*) FILTER (
      WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
    )::int
  `,
  apartmentTotalPrice: sql<number>`
    coalesce(
      round(sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      )),
      0
    )::double precision
  `,
  apartmentAvgPrice: sql<number>`
    coalesce(
      round(avg(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      )),
      0
    )::double precision
  `,
  apartmentTotalFloorArea: sql<number>`
    coalesce(
      round(sum(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ), 1),
      0
    )::double precision
  `,
  apartmentAvgFloorArea: sql<number>`
    coalesce(
      round(avg(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ), 1),
      0
    )::double precision
  `,
  apartmentAvgPricePerM2: sql<number | null>`
    case
      when sum(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
        AND ${propertySales.ApartmentFloorArea} >= ${MIN_APARTMENT_AREA} AND ${propertySales.ApartmentFloorArea} <= ${MAX_APARTMENT_AREA}
        AND ${propertySales.price} >= ${MIN_APARTMENT_PRICE} AND ${propertySales.price} <= ${MAX_APARTMENT_PRICE}
      ) > 0
      then round(sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
        AND ${propertySales.ApartmentFloorArea} >= ${MIN_APARTMENT_AREA} AND ${propertySales.ApartmentFloorArea} <= ${MAX_APARTMENT_AREA}
        AND ${propertySales.price} >= ${MIN_APARTMENT_PRICE} AND ${propertySales.price} <= ${MAX_APARTMENT_PRICE}
      ) / sum(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
        AND ${propertySales.ApartmentFloorArea} >= ${MIN_APARTMENT_AREA} AND ${propertySales.ApartmentFloorArea} <= ${MAX_APARTMENT_AREA}
        AND ${propertySales.price} >= ${MIN_APARTMENT_PRICE} AND ${propertySales.price} <= ${MAX_APARTMENT_PRICE}
      ))::double precision
      else null
    end
  `,
};

/**
 * House-specific aggregation fields using FILTER
 * Filters to pure house transactions for accurate price/m² calculations
 */
const houseSpecificFields = {
  houseTransactionCount: sql<number>`
    count(*) FILTER (
      WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
    )::int
  `,
  houseTotalPrice: sql<number>`
    coalesce(
      round(sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      )),
      0
    )::double precision
  `,
  houseAvgPrice: sql<number>`
    coalesce(
      round(avg(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      )),
      0
    )::double precision
  `,
  houseTotalFloorArea: sql<number>`
    coalesce(
      round(sum(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ), 1),
      0
    )::double precision
  `,
  houseAvgFloorArea: sql<number>`
    coalesce(
      round(avg(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ), 1),
      0
    )::double precision
  `,
  houseAvgPricePerM2: sql<number | null>`
    case
      when sum(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
        AND ${propertySales.HouseFloorArea} >= ${MIN_HOUSE_AREA} AND ${propertySales.HouseFloorArea} <= ${MAX_HOUSE_AREA}
        AND ${propertySales.price} >= ${MIN_HOUSE_PRICE} AND ${propertySales.price} <= ${MAX_HOUSE_PRICE}
      ) > 0
      then round(sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
        AND ${propertySales.HouseFloorArea} >= ${MIN_HOUSE_AREA} AND ${propertySales.HouseFloorArea} <= ${MAX_HOUSE_AREA}
        AND ${propertySales.price} >= ${MIN_HOUSE_PRICE} AND ${propertySales.price} <= ${MAX_HOUSE_PRICE}
      ) / sum(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
        AND ${propertySales.HouseFloorArea} >= ${MIN_HOUSE_AREA} AND ${propertySales.HouseFloorArea} <= ${MAX_HOUSE_AREA}
        AND ${propertySales.price} >= ${MIN_HOUSE_PRICE} AND ${propertySales.price} <= ${MAX_HOUSE_PRICE}
      ))::double precision
      else null
    end
  `,
};

/**
 * Apartment room distribution fields
 * Shows distribution of apartments by room count
 */
const apartmentRoomDistributionFields = {
  apt1Room: sql<number>`coalesce(sum(${propertySales.nbapt1pp}),0)::int`,
  apt2Room: sql<number>`coalesce(sum(${propertySales.nbapt2pp}),0)::int`,
  apt3Room: sql<number>`coalesce(sum(${propertySales.nbapt3pp}),0)::int`,
  apt4Room: sql<number>`coalesce(sum(${propertySales.nbapt4pp}),0)::int`,
  apt5Room: sql<number>`coalesce(sum(${propertySales.nbapt5pp}),0)::int`,
};

/**
 * House room distribution fields
 * Shows distribution of houses by room count
 */
const houseRoomDistributionFields = {
  house1Room: sql<number>`coalesce(sum(${propertySales.nbmai1pp}),0)::int`,
  house2Room: sql<number>`coalesce(sum(${propertySales.nbmai2pp}),0)::int`,
  house3Room: sql<number>`coalesce(sum(${propertySales.nbmai3pp}),0)::int`,
  house4Room: sql<number>`coalesce(sum(${propertySales.nbmai4pp}),0)::int`,
  house5Room: sql<number>`coalesce(sum(${propertySales.nbmai5pp}),0)::int`,
};

// ============================================================================
// Analytics Query Functions
// ============================================================================

/**
 * Get sales grouped by INSEE code (postal code)
 *
 * Uses primaryInseeCode (first code in the array) to avoid double-counting
 * transactions that span multiple INSEE codes (~5% of cases).
 *
 * Includes detailed apartment and house metrics using FILTER clauses for
 * accurate price/m² calculations on pure property type transactions.
 */
export async function getSalesByInseeCode(
  params: AnalyticsQueryParams
): Promise<SalesByInseeCode[]> {
  const whereClause = buildWhereClause(params);
  const orderByClause = buildOrderByClause(params);

  const results = await db
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`,
      ...baseAggregationFields,
      ...propertyTypeFields,
      ...apartmentSpecificFields,
      ...houseSpecificFields,
      ...apartmentRoomDistributionFields,
      ...houseRoomDistributionFields,
    })
    .from(propertySales)
    .where(and(whereClause, isNotNull(propertySales.primaryInseeCode)))
    .groupBy(propertySales.primaryInseeCode)
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  return results;
}

/**
 * Get sales grouped by insee code and section code
 */
export async function getSalesByInseeCodeAndSection(
  params: AnalyticsQueryParams
): Promise<SalesByInseeCodeAndSection[]> {
  const whereClause = buildWhereClause(params);
  const orderByClause = buildOrderByClause(params);

  const results = await db
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`,
      section: sql<string>`${propertySales.primarySection}`,
      ...baseAggregationFields,
      ...propertyTypeFields,
      ...apartmentSpecificFields,
      ...houseSpecificFields,
      ...apartmentRoomDistributionFields,
      ...houseRoomDistributionFields,
    })
    .from(propertySales)
    .where(and(whereClause, isNotNull(propertySales.primarySection)))
    .groupBy(propertySales.primaryInseeCode, propertySales.primarySection)
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  return results;
}

/**
 * Get sales grouped by property type
 */
export async function getSalesByPropertyType(
  params: AnalyticsQueryParams
): Promise<SalesByPropertyType[]> {
  const whereClause = buildWhereClause(params);
  const orderByClause = buildOrderByClause(params);

  const results = await db
    .select({
      propertyTypeCode: sql<number>`${propertySales.propertyTypeCode}`,
      propertyTypeLabel: sql<string>`${propertySales.propertyTypeLabel}`,
      ...baseAggregationFields,
    })
    .from(propertySales)
    .where(and(whereClause, isNotNull(propertySales.propertyTypeCode)))
    .groupBy(propertySales.propertyTypeCode, propertySales.propertyTypeLabel)
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  return results;
}

/**
 * Get sales grouped by year
 */
export async function getSalesByYear(
  params: AnalyticsQueryParams
): Promise<SalesByYear[]> {
  const whereClause = buildWhereClause(params);
  const orderByClause = buildOrderByClause(params);

  const results = await db
    .select({
      year: sql<number>`${propertySales.year}`,
      ...baseAggregationFields,
      ...propertyTypeFields,
    })
    .from(propertySales)
    .where(and(whereClause, isNotNull(propertySales.year)))
    .groupBy(propertySales.year)
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  return results;
}

/**
 * Get sales grouped by year and month
 */
export async function getSalesByMonth(
  params: AnalyticsQueryParams
): Promise<SalesByMonth[]> {
  const whereClause = buildWhereClause(params);

  const results = await db
    .select({
      year: sql<number>`${propertySales.year}`,
      month: sql<number>`${propertySales.month}`,
      ...baseAggregationFields,
      ...propertyTypeFields,
    })
    .from(propertySales)
    .where(
      and(
        whereClause,
        isNotNull(propertySales.year),
        isNotNull(propertySales.month)
      )
    )
    .groupBy(propertySales.year, propertySales.month)
    .orderBy(sql`${propertySales.year} desc, ${propertySales.month} desc`)
    .limit(params.limit)
    .offset(params.offset);

  return results;
}

/**
 * Get overall summary statistics (no grouping)
 * Provides a high-level overview of the entire dataset or filtered subset
 */
export async function getSalesSummary(
  params: Partial<AnalyticsQueryParams> = {}
): Promise<SalesSummary> {
  const whereClause = buildWhereClause(params);

  const results = await db
    .select({
      ...baseAggregationFields,
      ...propertyTypeFields,

      // Additional summary fields
      earliestDate: sql<string | undefined>`min(${propertySales.date})::text`,
      latestDate: sql<string | undefined>`max(${propertySales.date})::text`,
      uniqueDepartments: sql<number>`count(distinct ${propertySales.depCode})::int`,

      // Count unique primary INSEE codes
      uniqueInseeCodes: sql<number>`count(distinct ${propertySales.primaryInseeCode})::int`,
    })
    .from(propertySales)
    .where(whereClause);

  return results[0]; // Summary returns single row
}

/**
 * Get detailed apartment statistics for a specific group
 * This provides breakdown by room count for apartments
 */
export async function getApartmentStats(
  whereClause: ReturnType<typeof buildWhereClause>
) {
  const results = await db
    .select({
      count: sql<number>`sum(${propertySales.nbApartments})::int`,
      totalPrice: sql<number>`
        sum(${propertySales.price} * ${propertySales.nbApartments}::numeric /
            nullif((${propertySales.nbApartments} + ${propertySales.nbHouses}), 0))::double precision
      `,
      totalFloorArea: sql<number>`sum(${propertySales.ApartmentFloorArea})::double precision`,

      // Room distribution
      oneRoom: sql<number>`coalesce(sum(${propertySales.nbapt1pp}), 0)::int`,
      twoRoom: sql<number>`coalesce(sum(${propertySales.nbapt2pp}), 0)::int`,
      threeRoom: sql<number>`coalesce(sum(${propertySales.nbapt3pp}), 0)::int`,
      fourRoom: sql<number>`coalesce(sum(${propertySales.nbapt4pp}), 0)::int`,
      fiveRoomPlus: sql<number>`coalesce(sum(${propertySales.nbapt5pp}), 0)::int`,
    })
    .from(propertySales)
    .where(and(whereClause, sql`${propertySales.nbApartments} > 0`));

  const result = results[0];

  // Compute derived metrics
  const avgPrice = result.count > 0 ? result.totalPrice / result.count : 0;
  const avgFloorArea =
    result.count > 0 ? result.totalFloorArea / result.count : 0;
  const avgPricePerM2 =
    result.totalFloorArea > 0
      ? result.totalPrice / result.totalFloorArea
      : null;

  return {
    count: result.count,
    avgPrice,
    totalFloorArea: result.totalFloorArea,
    avgFloorArea,
    avgPricePerM2,
    roomDistribution: {
      oneRoom: result.oneRoom,
      twoRoom: result.twoRoom,
      threeRoom: result.threeRoom,
      fourRoom: result.fourRoom,
      fiveRoomPlus: result.fiveRoomPlus,
    },
  };
}

/**
 * Get detailed house statistics for a specific group
 * This provides breakdown by room count for houses
 */
export async function getHouseStats(
  whereClause: ReturnType<typeof buildWhereClause>
) {
  const results = await db
    .select({
      count: sql<number>`sum(${propertySales.nbHouses})::int`,
      totalPrice: sql<number>`
        sum(${propertySales.price} * ${propertySales.nbHouses}::numeric /
            nullif((${propertySales.nbApartments} + ${propertySales.nbHouses}), 0))::double precision
      `,
      totalFloorArea: sql<number>`sum(${propertySales.HouseFloorArea})::double precision`,

      // Room distribution
      oneRoom: sql<number>`coalesce(sum(${propertySales.nbmai1pp}), 0)::int`,
      twoRoom: sql<number>`coalesce(sum(${propertySales.nbmai2pp}), 0)::int`,
      threeRoom: sql<number>`coalesce(sum(${propertySales.nbmai3pp}), 0)::int`,
      fourRoom: sql<number>`coalesce(sum(${propertySales.nbmai4pp}), 0)::int`,
      fiveRoomPlus: sql<number>`coalesce(sum(${propertySales.nbmai5pp}), 0)::int`,
    })
    .from(propertySales)
    .where(and(whereClause, sql`${propertySales.nbHouses} > 0`));

  const result = results[0];

  // Compute derived metrics
  const avgPrice = result.count > 0 ? result.totalPrice / result.count : 0;
  const avgFloorArea =
    result.count > 0 ? result.totalFloorArea / result.count : 0;
  const avgPricePerM2 =
    result.totalFloorArea > 0
      ? result.totalPrice / result.totalFloorArea
      : null;

  return {
    count: result.count,
    avgPrice,
    totalFloorArea: result.totalFloorArea,
    avgFloorArea,
    avgPricePerM2,
    roomDistribution: {
      oneRoom: result.oneRoom,
      twoRoom: result.twoRoom,
      threeRoom: result.threeRoom,
      fourRoom: result.fourRoom,
      fiveRoomPlus: result.fiveRoomPlus,
    },
  };
}

// ============================================================================
// Decile Calculation Functions
// ============================================================================

/**
 * Generic function to calculate price per m² deciles
 */
export async function getPricePerM2Deciles(
  params: Partial<AnalyticsQueryParams> = {}
): Promise<PricePerM2Deciles> {
  const whereClause = buildWhereClause(params);

  const results = await db
    .select({
      decile1: sql<
        number | null
      >`round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile2: sql<
        number | null
      >`round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile3: sql<
        number | null
      >`round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile4: sql<
        number | null
      >`round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile5: sql<
        number | null
      >`round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile6: sql<
        number | null
      >`round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile7: sql<
        number | null
      >`round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile8: sql<
        number | null
      >`round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile9: sql<
        number | null
      >`round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      decile10: sql<
        number | null
      >`round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0)))::double precision`,
      totalTransactions: sql<number>`count(*)::int`,
    })
    .from(propertySales)
    .where(
      and(
        whereClause,
        sql`${propertySales.floorArea} > 0`,
        sql`${propertySales.price} > 0`
      )
    );

  const result = results[0];

  return {
    deciles: [
      { percentile: 10, value: result.decile1 },
      { percentile: 20, value: result.decile2 },
      { percentile: 30, value: result.decile3 },
      { percentile: 40, value: result.decile4 },
      { percentile: 50, value: result.decile5 },
      { percentile: 60, value: result.decile6 },
      { percentile: 70, value: result.decile7 },
      { percentile: 80, value: result.decile8 },
      { percentile: 90, value: result.decile9 },
      { percentile: 100, value: result.decile10 },
    ],
    totalTransactions: result.totalTransactions,
  };
}
