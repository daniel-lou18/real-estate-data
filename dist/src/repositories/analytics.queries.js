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
import { db } from "@/db";
import { propertySales } from "@/db/schema";
import { sql, eq, and, gte, lte, between, isNotNull } from "drizzle-orm";
// ============================================================================
// Shared Utilities
// ============================================================================
/**
 * Build WHERE clause from query parameters
 * Reusable across all analytics queries
 */
function buildWhereClause(filters) {
    const conditions = [];
    // Time filters - year
    if (filters.year) {
        conditions.push(eq(propertySales.year, filters.year));
    }
    // Time filters - year range
    if (filters.startYear && filters.endYear) {
        conditions.push(between(propertySales.year, filters.startYear, filters.endYear));
    }
    else {
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
        conditions.push(eq(propertySales.propertyTypeCode, filters.propertyTypeCode));
    }
    return conditions.length > 0 ? and(...conditions) : undefined;
}
/**
 * Build ORDER BY clause from query parameters
 */
function buildOrderByClause(params) {
    const { sortBy, sortOrder = "desc" } = params;
    if (!sortBy) {
        return sql `count(*) desc`; // Default: sort by count descending
    }
    const direction = sortOrder === "asc" ? sql `asc` : sql `desc`;
    switch (sortBy) {
        case "count":
            return sql `count(*) ${direction}`;
        case "totalPrice":
            return sql `sum(${propertySales.price}) ${direction}`;
        case "avgPrice":
            return sql `avg(${propertySales.price}) ${direction}`;
        case "avgPricePerM2":
            return sql `(sum(${propertySales.price}) / nullif(sum(${propertySales.floorArea}), 0)) ${direction}`;
        case "totalFloorArea":
            return sql `sum(${propertySales.floorArea}) ${direction}`;
        default:
            return sql `count(*) desc`;
    }
}
/**
 * Base aggregation fields used across all analytics queries
 * These represent the core metrics computed for each group
 */
const baseAggregationFields = {
    // Transaction count
    count: sql `count(*)::int`,
    // Price aggregates (in euros)
    totalPrice: sql `coalesce(sum(${propertySales.price}), 0)`,
    avgPrice: sql `coalesce(avg(${propertySales.price}), 0)`,
    minPrice: sql `coalesce(min(${propertySales.price}), 0)`,
    maxPrice: sql `coalesce(max(${propertySales.price}), 0)`,
    // Floor area aggregates (in m²)
    totalFloorArea: sql `coalesce(sum(${propertySales.floorArea}), 0)`,
    avgFloorArea: sql `coalesce(avg(${propertySales.floorArea}), 0)`,
    // Computed metric: Average price per m² (AFTER aggregation - weighted average)
    // This is the CORRECT way: SUM(price) / SUM(floorArea)
    // NOT: AVG(price / floorArea) which would be wrong
    avgPricePerM2: sql `
    case
      when sum(${propertySales.floorArea}) > 0
      then sum(${propertySales.price}) / sum(${propertySales.floorArea})
      else null
    end
  `,
};
/**
 * Property type breakdown fields
 * Total counts of different property types sold
 */
const propertyTypeFields = {
    totalProperties: sql `coalesce(sum(${propertySales.nbProperties}), 0)::int`,
    totalApartments: sql `coalesce(sum(${propertySales.nbApartments}), 0)::int`,
    totalHouses: sql `coalesce(sum(${propertySales.nbHouses}), 0)::int`,
    totalWorkspaces: sql `coalesce(sum(${propertySales.nbWorkspaces}), 0)::int`,
    totalSecondaryUnits: sql `coalesce(sum(${propertySales.nbSecondaryUnits}), 0)::int`,
};
/**
 * Apartment-specific aggregation fields using FILTER
 * Filters to pure apartment transactions for accurate price/m² calculations
 */
const apartmentSpecificFields = {
    apartmentTransactionCount: sql `
    count(*) FILTER (
      WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
    )::int
  `,
    apartmentTotalPrice: sql `
    coalesce(
      sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ),
      0
    )
  `,
    apartmentAvgPrice: sql `
    coalesce(
      avg(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ),
      0
    )
  `,
    apartmentTotalFloorArea: sql `
    coalesce(
      sum(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ),
      0
    )
  `,
    apartmentAvgFloorArea: sql `
    coalesce(
      avg(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ),
      0
    )
  `,
    apartmentAvgPricePerM2: sql `
    case
      when sum(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ) > 0
      then sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      ) / sum(${propertySales.ApartmentFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
      )
      else null
    end
  `,
};
/**
 * House-specific aggregation fields using FILTER
 * Filters to pure house transactions for accurate price/m² calculations
 */
const houseSpecificFields = {
    houseTransactionCount: sql `
    count(*) FILTER (
      WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
    )::int
  `,
    houseTotalPrice: sql `
    coalesce(
      sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ),
      0
    )
  `,
    houseAvgPrice: sql `
    coalesce(
      avg(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ),
      0
    )
  `,
    houseTotalFloorArea: sql `
    coalesce(
      sum(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ),
      0
    )
  `,
    houseAvgFloorArea: sql `
    coalesce(
      avg(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ),
      0
    )
  `,
    houseAvgPricePerM2: sql `
    case
      when sum(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ) > 0
      then sum(${propertySales.price}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      ) / sum(${propertySales.HouseFloorArea}) FILTER (
        WHERE ${propertySales.propertyTypeLabel} IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
      )
      else null
    end
  `,
};
/**
 * Apartment room distribution fields
 * Shows distribution of apartments by room count
 */
const apartmentRoomDistributionFields = {
    apt1Room: sql `coalesce(sum(${propertySales.nbapt1pp}),0)::int`,
    apt2Room: sql `coalesce(sum(${propertySales.nbapt2pp}),0)::int`,
    apt3Room: sql `coalesce(sum(${propertySales.nbapt3pp}),0)::int`,
    apt4Room: sql `coalesce(sum(${propertySales.nbapt4pp}),0)::int`,
    apt5Room: sql `coalesce(sum(${propertySales.nbapt5pp}),0)::int`,
};
/**
 * House room distribution fields
 * Shows distribution of houses by room count
 */
const houseRoomDistributionFields = {
    house1Room: sql `coalesce(sum(${propertySales.nbmai1pp}),0)::int`,
    house2Room: sql `coalesce(sum(${propertySales.nbmai2pp}),0)::int`,
    house3Room: sql `coalesce(sum(${propertySales.nbmai3pp}),0)::int`,
    house4Room: sql `coalesce(sum(${propertySales.nbmai4pp}),0)::int`,
    house5Room: sql `coalesce(sum(${propertySales.nbmai5pp}),0)::int`,
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
export async function getSalesByInseeCode(params) {
    const whereClause = buildWhereClause(params);
    const orderByClause = buildOrderByClause(params);
    const results = await db
        .select({
        inseeCode: sql `${propertySales.primaryInseeCode}`,
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
export async function getSalesByInseeCodeAndSection(params) {
    const whereClause = buildWhereClause(params);
    const orderByClause = buildOrderByClause(params);
    const results = await db
        .select({
        inseeCode: sql `${propertySales.primaryInseeCode}`,
        section: sql `${propertySales.primarySection}`,
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
export async function getSalesByPropertyType(params) {
    const whereClause = buildWhereClause(params);
    const orderByClause = buildOrderByClause(params);
    const results = await db
        .select({
        propertyTypeCode: sql `${propertySales.propertyTypeCode}`,
        propertyTypeLabel: sql `${propertySales.propertyTypeLabel}`,
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
export async function getSalesByYear(params) {
    const whereClause = buildWhereClause(params);
    const orderByClause = buildOrderByClause(params);
    const results = await db
        .select({
        year: sql `${propertySales.year}`,
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
export async function getSalesByMonth(params) {
    const whereClause = buildWhereClause(params);
    const orderByClause = buildOrderByClause(params);
    const results = await db
        .select({
        year: sql `${propertySales.year}`,
        month: sql `${propertySales.month}`,
        ...baseAggregationFields,
        ...propertyTypeFields,
    })
        .from(propertySales)
        .where(and(whereClause, isNotNull(propertySales.year), isNotNull(propertySales.month)))
        .groupBy(propertySales.year, propertySales.month)
        .orderBy(sql `${propertySales.year} desc, ${propertySales.month} desc`)
        .limit(params.limit)
        .offset(params.offset);
    return results;
}
/**
 * Get overall summary statistics (no grouping)
 * Provides a high-level overview of the entire dataset or filtered subset
 */
export async function getSalesSummary(params = {}) {
    const whereClause = buildWhereClause(params);
    const results = await db
        .select({
        ...baseAggregationFields,
        ...propertyTypeFields,
        // Additional summary fields
        earliestDate: sql `min(${propertySales.date})::text`,
        latestDate: sql `max(${propertySales.date})::text`,
        uniqueDepartments: sql `count(distinct ${propertySales.depCode})::int`,
        // Count unique primary INSEE codes
        uniqueInseeCodes: sql `count(distinct ${propertySales.primaryInseeCode})::int`,
    })
        .from(propertySales)
        .where(whereClause);
    return results[0]; // Summary returns single row
}
/**
 * Get detailed apartment statistics for a specific group
 * This provides breakdown by room count for apartments
 */
export async function getApartmentStats(whereClause) {
    const results = await db
        .select({
        count: sql `sum(${propertySales.nbApartments})::int`,
        totalPrice: sql `
        sum(${propertySales.price} * ${propertySales.nbApartments}::numeric /
            nullif((${propertySales.nbApartments} + ${propertySales.nbHouses}), 0))
      `,
        totalFloorArea: sql `sum(${propertySales.ApartmentFloorArea})`,
        // Room distribution
        oneRoom: sql `coalesce(sum(${propertySales.nbapt1pp}), 0)::int`,
        twoRoom: sql `coalesce(sum(${propertySales.nbapt2pp}), 0)::int`,
        threeRoom: sql `coalesce(sum(${propertySales.nbapt3pp}), 0)::int`,
        fourRoom: sql `coalesce(sum(${propertySales.nbapt4pp}), 0)::int`,
        fiveRoomPlus: sql `coalesce(sum(${propertySales.nbapt5pp}), 0)::int`,
    })
        .from(propertySales)
        .where(and(whereClause, sql `${propertySales.nbApartments} > 0`));
    const result = results[0];
    // Compute derived metrics
    const avgPrice = result.count > 0 ? result.totalPrice / result.count : 0;
    const avgFloorArea = result.count > 0 ? result.totalFloorArea / result.count : 0;
    const avgPricePerM2 = result.totalFloorArea > 0
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
export async function getHouseStats(whereClause) {
    const results = await db
        .select({
        count: sql `sum(${propertySales.nbHouses})::int`,
        totalPrice: sql `
        sum(${propertySales.price} * ${propertySales.nbHouses}::numeric /
            nullif((${propertySales.nbApartments} + ${propertySales.nbHouses}), 0))
      `,
        totalFloorArea: sql `sum(${propertySales.HouseFloorArea})`,
        // Room distribution
        oneRoom: sql `coalesce(sum(${propertySales.nbmai1pp}), 0)::int`,
        twoRoom: sql `coalesce(sum(${propertySales.nbmai2pp}), 0)::int`,
        threeRoom: sql `coalesce(sum(${propertySales.nbmai3pp}), 0)::int`,
        fourRoom: sql `coalesce(sum(${propertySales.nbmai4pp}), 0)::int`,
        fiveRoomPlus: sql `coalesce(sum(${propertySales.nbmai5pp}), 0)::int`,
    })
        .from(propertySales)
        .where(and(whereClause, sql `${propertySales.nbHouses} > 0`));
    const result = results[0];
    // Compute derived metrics
    const avgPrice = result.count > 0 ? result.totalPrice / result.count : 0;
    const avgFloorArea = result.count > 0 ? result.totalFloorArea / result.count : 0;
    const avgPricePerM2 = result.totalFloorArea > 0
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
 * Calculate 10 deciles for average price per square meter across the whole dataset
 * Returns the price per m² values that divide the dataset into 10 equal groups
 */
export async function getPricePerM2Deciles(params = {}) {
    const whereClause = buildWhereClause(params);
    const results = await db
        .select({
        decile1: sql `percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile2: sql `percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile3: sql `percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile4: sql `percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile5: sql `percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile6: sql `percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile7: sql `percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile8: sql `percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile9: sql `percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        decile10: sql `percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.floorArea}, 0))`,
        totalTransactions: sql `count(*)::int`,
    })
        .from(propertySales)
        .where(and(whereClause, sql `${propertySales.floorArea} > 0`, sql `${propertySales.price} > 0`));
    return results[0];
}
/**
 * Calculate 10 deciles for average price per square meter grouped by INSEE code
 * Returns deciles calculated from the avgPricePerM2 of each INSEE code group
 */
export async function getPricePerM2DecilesByInseeCode(params = {}) {
    const whereClause = buildWhereClause(params);
    // First, get the aggregated data by INSEE code
    const aggregatedData = await db
        .select({
        avgPricePerM2: sql `
        case
          when sum(${propertySales.floorArea}) > 0
          then sum(${propertySales.price}) / sum(${propertySales.floorArea})
          else null
        end
      `,
    })
        .from(propertySales)
        .where(and(whereClause, isNotNull(propertySales.primaryInseeCode), sql `${propertySales.floorArea} > 0`, sql `${propertySales.price} > 0`))
        .groupBy(propertySales.primaryInseeCode);
    // Then calculate deciles from the aggregated data
    const results = await db
        .select({
        decile1: sql `percentile_cont(0.1) within group (order by avg_price_per_m2)`,
        decile2: sql `percentile_cont(0.2) within group (order by avg_price_per_m2)`,
        decile3: sql `percentile_cont(0.3) within group (order by avg_price_per_m2)`,
        decile4: sql `percentile_cont(0.4) within group (order by avg_price_per_m2)`,
        decile5: sql `percentile_cont(0.5) within group (order by avg_price_per_m2)`,
        decile6: sql `percentile_cont(0.6) within group (order by avg_price_per_m2)`,
        decile7: sql `percentile_cont(0.7) within group (order by avg_price_per_m2)`,
        decile8: sql `percentile_cont(0.8) within group (order by avg_price_per_m2)`,
        decile9: sql `percentile_cont(0.9) within group (order by avg_price_per_m2)`,
        decile10: sql `percentile_cont(1.0) within group (order by avg_price_per_m2)`,
        totalInseeCodes: sql `count(*)::int`,
    })
        .from(db
        .select({
        avgPricePerM2: sql `
            case
              when sum(${propertySales.floorArea}) > 0
              then sum(${propertySales.price}) / sum(${propertySales.floorArea})
              else null
            end
          `,
    })
        .from(propertySales)
        .where(and(whereClause, isNotNull(propertySales.primaryInseeCode), sql `${propertySales.floorArea} > 0`, sql `${propertySales.price} > 0`))
        .groupBy(propertySales.primaryInseeCode)
        .as("aggregated_data"))
        .where(sql `avg_price_per_m2 is not null`);
    return results[0];
}
/**
 * Calculate 10 deciles for average price per square meter grouped by INSEE code and section
 * Returns deciles calculated from the avgPricePerM2 of each INSEE code + section group
 */
export async function getPricePerM2DecilesByInseeCodeAndSection(params = {}) {
    const whereClause = buildWhereClause(params);
    // Calculate deciles from aggregated data by INSEE code and section
    const results = await db
        .select({
        decile1: sql `percentile_cont(0.1) within group (order by avg_price_per_m2)`,
        decile2: sql `percentile_cont(0.2) within group (order by avg_price_per_m2)`,
        decile3: sql `percentile_cont(0.3) within group (order by avg_price_per_m2)`,
        decile4: sql `percentile_cont(0.4) within group (order by avg_price_per_m2)`,
        decile5: sql `percentile_cont(0.5) within group (order by avg_price_per_m2)`,
        decile6: sql `percentile_cont(0.6) within group (order by avg_price_per_m2)`,
        decile7: sql `percentile_cont(0.7) within group (order by avg_price_per_m2)`,
        decile8: sql `percentile_cont(0.8) within group (order by avg_price_per_m2)`,
        decile9: sql `percentile_cont(0.9) within group (order by avg_price_per_m2)`,
        decile10: sql `percentile_cont(1.0) within group (order by avg_price_per_m2)`,
        totalSections: sql `count(*)::int`,
    })
        .from(db
        .select({
        avgPricePerM2: sql `
            case
              when sum(${propertySales.floorArea}) > 0
              then sum(${propertySales.price}) / sum(${propertySales.floorArea})
              else null
            end
          `,
    })
        .from(propertySales)
        .where(and(whereClause, isNotNull(propertySales.primaryInseeCode), isNotNull(propertySales.primarySection), sql `${propertySales.floorArea} > 0`, sql `${propertySales.price} > 0`))
        .groupBy(propertySales.primaryInseeCode, propertySales.primarySection)
        .as("aggregated_data"))
        .where(sql `avg_price_per_m2 is not null`);
    return results[0];
}
// Export utility functions for use in handlers if needed
export { buildWhereClause, buildOrderByClause };
