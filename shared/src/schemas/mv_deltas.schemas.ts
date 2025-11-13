import { z } from "zod";
import type {
  ApartmentCompositionField,
  HouseCompositionField,
  MetricField,
} from "../types";
import * as schemas from "../schemas/";

// ----------------------------------------------------------------------------
// Shared numeric helper (allows nulls for pct_change when base==0 or missing)
// ----------------------------------------------------------------------------
const NullableNumber = z.union([z.number(), z.null()]);

// ----------------------------------------------------------------------------
// Deltas for a single metric: base, current, delta, pct_change
// ----------------------------------------------------------------------------
export const MetricDeltaSchema = z.object({
  base: NullableNumber.describe("Value in the base period (e.g. year N-1)"),
  current: NullableNumber.describe(
    "Value in the comparison period (e.g. year N)"
  ),
  delta: NullableNumber.describe("Absolute difference: current - base"),
  pct_change: NullableNumber.describe(
    "Percentage change: 100 * (current - base) / NULLIF(base, 0); null if base is 0 or missing"
  ),
});

// ----------------------------------------------------------------------------
// Yearly deltas aggregate: core metrics (modeled after AggregateMetricsMV)
// Each metric from AggregateMetricsMV gets a MetricDelta object
// ----------------------------------------------------------------------------
export const YearlyDeltasMetricsSchema = z.object<
  Record<MetricField, typeof MetricDeltaSchema>
>({
  // Counts and totals
  total_sales: MetricDeltaSchema.describe("Deltas for total number of transactions"),
  total_price: MetricDeltaSchema.describe("Deltas for sum of transaction prices"),
  avg_price: MetricDeltaSchema.describe("Deltas for average transaction price"),

  // Areas
  total_area: MetricDeltaSchema.describe("Deltas for sum of area for the group"),
  avg_area: MetricDeltaSchema.describe("Deltas for average area for the group"),

  // Weighted price per m²
  avg_price_m2: MetricDeltaSchema.describe(
    "Deltas for SUM(price) / NULLIF(SUM(area), 0) at group level"
  ),

  // Distribution statistics
  min_price: MetricDeltaSchema.describe("Deltas for minimum price"),
  max_price: MetricDeltaSchema.describe("Deltas for maximum price"),
  median_price: MetricDeltaSchema.describe("Deltas for median price"),
  median_area: MetricDeltaSchema.describe("Deltas for median area"),
  min_price_m2: MetricDeltaSchema.describe("Deltas for minimum price/m²"),
  max_price_m2: MetricDeltaSchema.describe("Deltas for maximum price/m²"),
  price_m2_p25: MetricDeltaSchema.describe("Deltas for 25th percentile price/m²"),
  price_m2_p75: MetricDeltaSchema.describe("Deltas for 75th percentile price/m²"),
  price_m2_iqr: MetricDeltaSchema.describe("Deltas for IQR of price/m²"),
  price_m2_stddev: MetricDeltaSchema.describe("Deltas for stddev of price/m²"),
});

// ----------------------------------------------------------------------------
// Optional composition breakdowns (keep if you need apartment/house breakdown)
// ----------------------------------------------------------------------------
const ApartmentCompositionDeltas = z.object<
  Record<ApartmentCompositionField, typeof MetricDeltaSchema>
>({
  total_apartments: MetricDeltaSchema,
  apartment_1_room: MetricDeltaSchema,
  apartment_2_room: MetricDeltaSchema,
  apartment_3_room: MetricDeltaSchema,
  apartment_4_room: MetricDeltaSchema,
  apartment_5_room: MetricDeltaSchema,
});

const HouseCompositionDeltas = z.object<
  Record<HouseCompositionField, typeof MetricDeltaSchema>
>({
  total_houses: MetricDeltaSchema,
  house_1_room: MetricDeltaSchema,
  house_2_room: MetricDeltaSchema,
  house_3_room: MetricDeltaSchema,
  house_4_room: MetricDeltaSchema,
  house_5_room: MetricDeltaSchema,
});

// ----------------------------------------------------------------------------
// Yearly deltas by INSEE (primary canonical MV row)
// ----------------------------------------------------------------------------
export const YearlyDeltasByInseeSchema = z.object({
  // Dimensions
  inseeCode: schemas.INSEE_CODE_SCHEMA.describe("INSEE code for the commune"),
  year: schemas.YEAR_SCHEMA.describe("Comparison year (current period)"),
  base_year: schemas.YEAR_SCHEMA.describe(
    "Base year used for the delta (e.g. year - 1)"
  ),

  // Core metrics deltas
  ...YearlyDeltasMetricsSchema.shape,

  // Optional breakdowns (include depending on MV content)
  apartments: ApartmentCompositionDeltas.optional(),
  houses: HouseCompositionDeltas.optional(),
});

// ----------------------------------------------------------------------------
// Yearly deltas by SECTION (if you want section-level MV rows)
// ----------------------------------------------------------------------------
export const YearlyDeltasBySectionSchema = YearlyDeltasByInseeSchema.extend({
  section: schemas.SECTION_SCHEMA.describe(
    "Section identifier within the commune"
  ),
  // inseeCode, year, base_year and metrics are inherited
});

// ----------------------------------------------------------------------------
// Query param schemas for delta endpoints
// ----------------------------------------------------------------------------

export const YearDeltaParamsSchema = schemas.PaginationParamsSchema.extend({
  level: schemas.LEVEL_SCHEMA,
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  section: schemas.SECTION_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.describe("Comparison year (e.g. 2024)").optional(),
  base_year: schemas.YEAR_SCHEMA.describe("Base year (e.g. 2023)").optional(),
  metric: schemas.METRIC_FIELD_SCHEMA.optional().describe(
    "If provided, limit sorting/filters to this metric"
  ),
  sortBy: z
    .enum([
      "pct_change",
      "delta",
      "current",
      "base",
      "rank",
      // to allow disambiguation when metric present, client/server should map
      // e.g. "avg_price_m2.pct_change" - but keep simple for now
    ])
    .optional()
    .describe("Sort ordering applied to the returned rows"),
  sortOrder: schemas.SortOrderSchema,
  tag: z
    .string()
    .optional()
    .describe("Optional attribute tag filter (e.g., 'coastal')"),
  min_current: z.coerce
    .number()
    .optional()
    .describe("Minimum current-period metric value (numeric)"),
  max_current: z.coerce
    .number()
    .optional()
    .describe("Maximum current-period metric value (numeric)"),
  min_base: z.coerce
    .number()
    .optional()
    .describe("Minimum base-period metric value (numeric)"),
  min_delta: z.coerce.number().optional().describe("Minimum absolute delta"),
  min_pct_change: z.coerce
    .number()
    .optional()
    .describe("Minimum percentage change (e.g. 10 => 10%)"),
});
