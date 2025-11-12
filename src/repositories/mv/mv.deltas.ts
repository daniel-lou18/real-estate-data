import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  apartments_by_insee_code_year_deltas,
  houses_by_insee_code_year_deltas,
  apartments_by_section_year_deltas,
  houses_by_section_year_deltas,
} from "@/db/schema/mv_property_sales_deltas";
import type {
  YearlyDeltasByInsee,
  YearlyDeltasBySection,
  YearDeltaParams,
} from "@/routes/sales/mv/mv_deltas.schemas";

// ----------------------------------------------------------------------------
// Metric lists (matching the schema)
// ----------------------------------------------------------------------------

const AGG_METRICS = [
  "total_sales",
  "total_price",
  "avg_price",
  "total_area",
  "avg_area",
  "avg_price_m2",
  "median_price",
  "median_area",
  "price_m2_p25",
  "price_m2_p75",
  "price_m2_iqr",
  "price_m2_stddev",
] as const;

const APARTMENT_COMPOSITION_METRICS = [
  "total_apartments",
  "apartment_1_room",
  "apartment_2_room",
  "apartment_3_room",
  "apartment_4_room",
  "apartment_5_room",
] as const;

const HOUSE_COMPOSITION_METRICS = [
  "total_houses",
  "house_1_room",
  "house_2_room",
  "house_3_room",
  "house_4_room",
  "house_5_room",
] as const;

// ----------------------------------------------------------------------------
// Transformation helpers: Convert flat DB structure to nested Zod schema
// ----------------------------------------------------------------------------

/**
 * Transforms a flat metric delta row (metric_base, metric_current, metric_delta, metric_pct_change)
 * into a nested MetricDelta object (metric: { base, current, delta, pct_change })
 */
function transformMetricDelta(
  row: Record<string, any>,
  metricName: string
): {
  base: number | null;
  current: number | null;
  delta: number | null;
  pct_change: number | null;
} {
  return {
    base: row[`${metricName}_base`] ?? null,
    current: row[`${metricName}_current`] ?? null,
    delta: row[`${metricName}_delta`] ?? null,
    pct_change: row[`${metricName}_pct_change`] ?? null,
  };
}

/**
 * Transforms composition metrics (apartments or houses) into nested structure
 */
function transformCompositionDeltas(
  row: Record<string, any>,
  metrics: readonly string[]
): Record<
  string,
  {
    base: number | null;
    current: number | null;
    delta: number | null;
    pct_change: number | null;
  }
> {
  const result: Record<
    string,
    {
      base: number | null;
      current: number | null;
      delta: number | null;
      pct_change: number | null;
    }
  > = {};
  for (const metric of metrics) {
    result[metric] = transformMetricDelta(row, metric);
  }
  return result;
}

/**
 * Transforms a raw delta row from the database into the Zod schema format
 */
function transformDeltaRow<
  T extends { inseeCode: string; year: number; base_year: number }
>(
  row: Record<string, any>,
  hasSection: boolean,
  hasApartments: boolean,
  hasHouses: boolean
): T {
  const base: any = {
    inseeCode: row.insee_code ?? row.inseeCode,
    year: row.year,
    base_year: row.base_year,
  };

  if (hasSection) {
    base.section = row.section;
  }

  // Transform core metrics
  for (const metric of AGG_METRICS) {
    base[metric] = transformMetricDelta(row, metric);
  }

  // Transform composition metrics if present
  if (hasApartments) {
    base.apartments = transformCompositionDeltas(
      row,
      APARTMENT_COMPOSITION_METRICS
    );
  }

  if (hasHouses) {
    base.houses = transformCompositionDeltas(row, HOUSE_COMPOSITION_METRICS);
  }

  return base as T;
}

// ----------------------------------------------------------------------------
// OrderBy helper for delta views
// ----------------------------------------------------------------------------

/**
 * Gets orderBy expressions for delta views.
 * Handles sortBy values: pct_change, delta, current, base, rank
 * If metric is provided, sorts by that specific metric's field.
 * Otherwise, defaults to total_sales.
 */
function getDeltaOrderBy(
  viewName: string,
  sortBy: YearDeltaParams["sortBy"],
  sortOrder: YearDeltaParams["sortOrder"],
  metric?: YearDeltaParams["metric"]
) {
  const dir = sortOrder === "asc" ? asc : desc;
  const targetMetric = metric || "total_sales";

  // Use sql template literals to access columns dynamically
  // Column names are safe because they're validated by the schema enum
  const getMetricColumn = (suffix: string) => {
    const columnName = `${targetMetric}_${suffix}`;
    // Use sql.raw to safely inject the column name (validated by enum)
    return sql<number>`${sql.raw(`"${columnName}"`)}`;
  };

  switch (sortBy) {
    case "pct_change":
      return [dir(getMetricColumn("pct_change"))];
    case "delta":
      return [dir(getMetricColumn("delta"))];
    case "current":
      return [dir(getMetricColumn("current"))];
    case "base":
      return [dir(getMetricColumn("base"))];
    case "rank":
      // For rank, we'd need to compute it, but for now default to pct_change
      return [dir(getMetricColumn("pct_change"))];
    default:
      // Default to sorting by total_sales_current
      return [dir(getMetricColumn("current"))];
  }
}

// ----------------------------------------------------------------------------
// Where condition builders
// ----------------------------------------------------------------------------

function buildInseeDeltaWhereConditions(
  view:
    | typeof apartments_by_insee_code_year_deltas
    | typeof houses_by_insee_code_year_deltas,
  params: YearDeltaParams
) {
  const conditions = [];
  if (params.inseeCode) {
    conditions.push(eq(sql`insee_code`, params.inseeCode));
  }
  if (params.year) {
    conditions.push(eq(sql`year`, params.year));
  }
  if (params.base_year) {
    conditions.push(eq(sql`base_year`, params.base_year));
  }

  // Metric-specific filters (if metric is provided)
  const metric = params.metric || "total_sales";
  const getMetricColumn = (suffix: string) => {
    const columnName = `${metric}_${suffix}`;
    return sql<number>`${sql.raw(`"${columnName}"`)}`;
  };

  if (params.min_current !== undefined) {
    conditions.push(gte(getMetricColumn("current"), params.min_current));
  }
  if (params.max_current !== undefined) {
    conditions.push(lte(getMetricColumn("current"), params.max_current));
  }
  if (params.min_base !== undefined) {
    conditions.push(gte(getMetricColumn("base"), params.min_base));
  }
  if (params.min_delta !== undefined) {
    conditions.push(gte(getMetricColumn("delta"), params.min_delta));
  }
  if (params.min_pct_change !== undefined) {
    conditions.push(gte(getMetricColumn("pct_change"), params.min_pct_change));
  }

  return conditions;
}

function buildSectionDeltaWhereConditions(
  view:
    | typeof apartments_by_section_year_deltas
    | typeof houses_by_section_year_deltas,
  params: YearDeltaParams
) {
  const conditions = [];
  if (params.inseeCode) {
    conditions.push(eq(sql`insee_code`, params.inseeCode));
  }
  if (params.section) {
    conditions.push(eq(sql`section`, params.section));
  }
  if (params.year) {
    conditions.push(eq(sql`year`, params.year));
  }
  if (params.base_year) {
    conditions.push(eq(sql`base_year`, params.base_year));
  }

  // Metric-specific filters (if metric is provided)
  const metric = params.metric || "total_sales";
  const getMetricColumn = (suffix: string) => {
    const columnName = `${metric}_${suffix}`;
    return sql<number>`${sql.raw(`"${columnName}"`)}`;
  };

  if (params.min_current !== undefined) {
    conditions.push(gte(getMetricColumn("current"), params.min_current));
  }
  if (params.max_current !== undefined) {
    conditions.push(lte(getMetricColumn("current"), params.max_current));
  }
  if (params.min_base !== undefined) {
    conditions.push(gte(getMetricColumn("base"), params.min_base));
  }
  if (params.min_delta !== undefined) {
    conditions.push(gte(getMetricColumn("delta"), params.min_delta));
  }
  if (params.min_pct_change !== undefined) {
    conditions.push(gte(getMetricColumn("pct_change"), params.min_pct_change));
  }

  return conditions;
}

// ----------------------------------------------------------------------------
// Repositories: Yearly deltas by INSEE code
// ----------------------------------------------------------------------------

export async function getAptsByInseeYearDeltas(
  params: YearDeltaParams
): Promise<YearlyDeltasByInsee[]> {
  const whereConditions = buildInseeDeltaWhereConditions(
    apartments_by_insee_code_year_deltas,
    params
  );

  const orderBy = getDeltaOrderBy(
    "apartments_by_insee_code_year_deltas",
    params.sortBy,
    params.sortOrder,
    params.metric
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_year_deltas)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  // Transform flat DB structure to nested Zod schema format
  return results.map((row) =>
    transformDeltaRow<YearlyDeltasByInsee>(
      row as Record<string, any>,
      false,
      true,
      false
    )
  );
}

export async function getHousesByInseeYearDeltas(
  params: YearDeltaParams
): Promise<YearlyDeltasByInsee[]> {
  const whereConditions = buildInseeDeltaWhereConditions(
    houses_by_insee_code_year_deltas,
    params
  );

  const orderBy = getDeltaOrderBy(
    "houses_by_insee_code_year_deltas",
    params.sortBy,
    params.sortOrder,
    params.metric
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_year_deltas)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  // Transform flat DB structure to nested Zod schema format
  return results.map((row) =>
    transformDeltaRow<YearlyDeltasByInsee>(
      row as Record<string, any>,
      false,
      false,
      true
    )
  );
}

// ----------------------------------------------------------------------------
// Repositories: Yearly deltas by section
// ----------------------------------------------------------------------------

export async function getAptsBySectionYearDeltas(
  params: YearDeltaParams
): Promise<YearlyDeltasBySection[]> {
  const whereConditions = buildSectionDeltaWhereConditions(
    apartments_by_section_year_deltas,
    params
  );

  const orderBy = getDeltaOrderBy(
    "apartments_by_section_year_deltas",
    params.sortBy,
    params.sortOrder,
    params.metric
  );

  const results = await db
    .select()
    .from(apartments_by_section_year_deltas)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  // Transform flat DB structure to nested Zod schema format
  return results.map((row) =>
    transformDeltaRow<YearlyDeltasBySection>(
      row as Record<string, any>,
      true,
      true,
      false
    )
  );
}

export async function getHousesBySectionYearDeltas(
  params: YearDeltaParams
): Promise<YearlyDeltasBySection[]> {
  const whereConditions = buildSectionDeltaWhereConditions(
    houses_by_section_year_deltas,
    params
  );

  const orderBy = getDeltaOrderBy(
    "houses_by_section_year_deltas",
    params.sortBy,
    params.sortOrder,
    params.metric
  );

  const results = await db
    .select()
    .from(houses_by_section_year_deltas)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  // Transform flat DB structure to nested Zod schema format
  return results.map((row) =>
    transformDeltaRow<YearlyDeltasBySection>(
      row as Record<string, any>,
      true,
      false,
      true
    )
  );
}
