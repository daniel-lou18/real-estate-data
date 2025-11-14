import { FEATURE_YEARS, MONTHS, UserIntentSchema } from "@app/shared";
import type { FilterState, NumericFilter, UserIntent } from "./types";

const DEFAULT_FIELD: FilterState["field"] = "avg_price_m2";
const DEFAULT_PROPERTY_TYPE: FilterState["propertyType"] = "apartment";
const DEFAULT_LEVEL: FilterState["level"] = "commune";
const DEFAULT_SORT_ORDER: NonNullable<FilterState["sortOrder"]> = "desc";
const DEFAULT_SORT_BY: NonNullable<FilterState["sortBy"]> = "avg_price_m2";
const DEFAULT_LIMIT = 200;
const DEFAULT_YEAR = FEATURE_YEARS[
  FEATURE_YEARS.length - 1
] as FilterState["year"];

const SORTABLE_METRICS: ReadonlySet<FilterState["field"]> = new Set([
  "total_sales",
  "avg_price_m2",
  "total_price",
  "avg_price",
]);

export function translateIntent(intent: UserIntent) {
  const parsed = UserIntentSchema.parse(intent);

  const clonedFilters = cloneFilters(parsed.filters);
  const propertyType = parsed.propertyType ?? DEFAULT_PROPERTY_TYPE;

  const filtersWithMinSales = applyMinSales(clonedFilters, parsed.minSales);
  const filters = normalizeEmptyFilters(filtersWithMinSales);

  const inseeCodes = parsed.inseeCodes ?? [];
  const sections = parsed.sections ?? [];
  const level = inferLevel(parsed.primaryDimension, sections);
  const field = parsed.metric ?? DEFAULT_FIELD;
  const year = isYear(parsed.year) ? parsed.year : DEFAULT_YEAR;
  const month = isMonth(parsed.month) ? parsed.month : undefined;
  const sortBy = inferSortBy(parsed.primaryDimension, parsed.metric);
  const sortOrder = parsed.sortOrder ?? DEFAULT_SORT_ORDER;
  const limit = parsed.limit ?? DEFAULT_LIMIT;

  return {
    level,
    propertyType,
    field,
    year,
    inseeCodes,
    sections,
    month,
    filters,
    sortBy,
    sortOrder,
    limit,
    offset: 0,
  } satisfies FilterState;
}

function cloneFilters(
  filters: NumericFilter | undefined
): NumericFilter | undefined {
  if (!filters) return undefined;
  return { ...filters } as NumericFilter;
}

function applyMinSales(
  filters: NumericFilter | undefined,
  minSales: number | undefined
): NumericFilter | undefined {
  if (minSales == null) {
    return filters;
  }
  const normalized = Math.max(0, Math.trunc(minSales));
  if (normalized <= 0) {
    return filters;
  }
  const base = filters ?? ({} as NumericFilter);
  return {
    ...base,
    total_sales: { operation: "gte", value: normalized },
  } as NumericFilter;
}

function normalizeEmptyFilters(
  filters: NumericFilter | undefined
): NumericFilter | undefined {
  if (!filters) return undefined;
  return Object.keys(filters).length > 0 ? filters : undefined;
}

function inferLevel(
  primaryDimension: UserIntent["primaryDimension"],
  sections: string[]
): FilterState["level"] {
  if (primaryDimension === "section" || sections.length > 0) {
    return "section";
  }
  return DEFAULT_LEVEL;
}

function inferSortBy(
  primaryDimension: UserIntent["primaryDimension"],
  metric: UserIntent["metric"]
): FilterState["sortBy"] {
  if (primaryDimension) {
    return primaryDimension;
  }
  if (metric && SORTABLE_METRICS.has(metric)) {
    return metric;
  }
  return DEFAULT_SORT_BY;
}

function isYear(value: number | undefined): value is FilterState["year"] {
  return value != null && FEATURE_YEARS.includes(value as FilterState["year"]);
}

function isMonth(
  value: number | undefined
): value is NonNullable<FilterState["month"]> {
  return (
    value != null && MONTHS.includes(value as NonNullable<FilterState["month"]>)
  );
}
