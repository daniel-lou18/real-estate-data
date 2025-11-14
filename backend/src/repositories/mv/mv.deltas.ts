import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  apartments_by_insee_code_year_deltas,
  houses_by_insee_code_year_deltas,
  apartments_by_section_year_deltas,
  houses_by_section_year_deltas,
} from "@/db/schema/mv_property_sales_deltas";
import {
  APARTMENT_COMPOSITION_FIELDS,
  HOUSE_COMPOSITION_FIELDS,
  METRIC_FIELDS,
  type YearlyDeltasByInsee,
  type YearlyDeltasBySection,
  type YearDeltaParams,
} from "@app/shared";

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
  T extends { inseeCode: string; year: number; base_year: number },
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
  for (const metric of METRIC_FIELDS) {
    base[metric] = transformMetricDelta(row, metric);
  }

  // Transform composition metrics if present
  if (hasApartments) {
    base.apartments = transformCompositionDeltas(
      row,
      APARTMENT_COMPOSITION_FIELDS
    );
  }

  if (hasHouses) {
    base.houses = transformCompositionDeltas(row, HOUSE_COMPOSITION_FIELDS);
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

/**
 * Adds inseeCode filter conditions to the conditions array
 */
function addInseeCodeConditions<T extends { inseeCode: any }>(
  conditions: ReturnType<typeof eq>[],
  view: T,
  inseeCodes: string[] | undefined
): void {
  if (!inseeCodes || inseeCodes.length === 0) return;

  // Ensure it's an array (schema transform should handle this, but be defensive)
  const codes = Array.isArray(inseeCodes) ? inseeCodes : [inseeCodes];

  if (codes.length === 1) {
    conditions.push(eq(view.inseeCode, codes[0]));
  } else {
    conditions.push(inArray(view.inseeCode, codes));
  }
}

/**
 * Adds section filter conditions to the conditions array
 */
function addSectionConditions<T extends { section: any }>(
  conditions: ReturnType<typeof eq>[],
  view: T,
  sections: string[] | undefined
): void {
  if (!sections || sections.length === 0) return;

  // Ensure it's an array (schema transform should handle this, but be defensive)
  const secs = Array.isArray(sections) ? sections : [sections];

  if (secs.length === 1) {
    conditions.push(eq(view.section, secs[0]));
  } else {
    conditions.push(inArray(view.section, secs));
  }
}

/**
 * Adds temporal filter conditions (year, base_year) to the conditions array
 */
function addTemporalConditions<T extends { year: any; base_year: any }>(
  conditions: ReturnType<typeof eq>[],
  view: T,
  params: YearDeltaParams
): void {
  if (params.year) {
    conditions.push(eq(view.year, params.year));
  }
  if (params.base_year) {
    conditions.push(eq(view.base_year, params.base_year));
  }
}

/**
 * Adds metric-specific filter conditions to the conditions array
 */
function addMetricFilterConditions(
  conditions: ReturnType<typeof eq>[],
  params: YearDeltaParams
): void {
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
}

/**
 * Builds where conditions for delta queries.
 * @param view - The materialized view to query
 * @param params - Query parameters
 * @param includeSection - Whether to include section filtering (for section-level views)
 */
function buildDeltaWhereConditions<
  T extends { inseeCode: any; year: any; base_year: any; section?: any },
>(
  view: T,
  params: YearDeltaParams,
  includeSection: boolean = false
): ReturnType<typeof eq>[] {
  const conditions: ReturnType<typeof eq>[] = [];

  addInseeCodeConditions(conditions, view, params.inseeCodes);
  if (includeSection && view.section) {
    addSectionConditions(
      conditions,
      view as T & { section: any },
      params.sections
    );
  }
  addTemporalConditions(conditions, view, params);
  addMetricFilterConditions(conditions, params);

  return conditions;
}

function buildInseeDeltaWhereConditions(
  view:
    | typeof apartments_by_insee_code_year_deltas
    | typeof houses_by_insee_code_year_deltas,
  params: YearDeltaParams
) {
  return buildDeltaWhereConditions(view as any, params, false);
}

function buildSectionDeltaWhereConditions(
  view:
    | typeof apartments_by_section_year_deltas
    | typeof houses_by_section_year_deltas,
  params: YearDeltaParams
) {
  return buildDeltaWhereConditions(view as any, params, true);
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
