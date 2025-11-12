import { z } from "zod";

// ----------------------------------------------------------------------------
// Shared numeric helper (allows nulls for pct_change when base==0 or missing)
// ----------------------------------------------------------------------------
const NullableNumber = z.union([z.number(), z.null()]);

// ----------------------------------------------------------------------------
// Deltas for a single metric: base, current, delta, pct_change
// ----------------------------------------------------------------------------
const MetricDelta = z.object({
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
export const YearlyDeltasMetrics = z.object({
  // Counts and totals
  total_sales: MetricDelta.describe("Deltas for total number of transactions"),
  total_price: MetricDelta.describe("Deltas for sum of transaction prices"),
  avg_price: MetricDelta.describe("Deltas for average transaction price"),

  // Areas
  total_area: MetricDelta.describe("Deltas for sum of area for the group"),
  avg_area: MetricDelta.describe("Deltas for average area for the group"),

  // Weighted price per m²
  avg_price_m2: MetricDelta.describe(
    "Deltas for SUM(price) / NULLIF(SUM(area), 0) at group level"
  ),

  // Distribution statistics
  median_price: MetricDelta.describe("Deltas for median price"),
  median_area: MetricDelta.describe("Deltas for median area"),
  price_m2_p25: MetricDelta.describe("Deltas for 25th percentile price/m²"),
  price_m2_p75: MetricDelta.describe("Deltas for 75th percentile price/m²"),
  price_m2_iqr: MetricDelta.describe("Deltas for IQR of price/m²"),
  price_m2_stddev: MetricDelta.describe("Deltas for stddev of price/m²"),
});

// ----------------------------------------------------------------------------
// Optional composition breakdowns (keep if you need apartment/house breakdown)
// ----------------------------------------------------------------------------
const ApartmentCompositionDeltas = z.object({
  total_apartments: MetricDelta,
  apartment_1_room: MetricDelta,
  apartment_2_room: MetricDelta,
  apartment_3_room: MetricDelta,
  apartment_4_room: MetricDelta,
  apartment_5_room: MetricDelta,
});

const HouseCompositionDeltas = z.object({
  total_houses: MetricDelta,
  house_1_room: MetricDelta,
  house_2_room: MetricDelta,
  house_3_room: MetricDelta,
  house_4_room: MetricDelta,
  house_5_room: MetricDelta,
});

// ----------------------------------------------------------------------------
// Yearly deltas by INSEE (primary canonical MV row)
// ----------------------------------------------------------------------------
export const YearlyDeltasByInseeSchema = z.object({
  // Dimensions
  inseeCode: z.string().describe("INSEE code for the commune"),
  year: z.number().int().describe("Comparison year (current period)"),
  base_year: z
    .number()
    .int()
    .describe("Base year used for the delta (e.g. year - 1)"),

  // Core metrics deltas
  ...YearlyDeltasMetrics.shape,

  // Optional breakdowns (include depending on MV content)
  apartments: ApartmentCompositionDeltas.optional(),
  houses: HouseCompositionDeltas.optional(),
});

// ----------------------------------------------------------------------------
// Yearly deltas by SECTION (if you want section-level MV rows)
// ----------------------------------------------------------------------------
export const YearlyDeltasBySectionSchema = YearlyDeltasByInseeSchema.extend({
  section: z.string().describe("Section identifier within the commune"),
  // inseeCode, year, base_year and metrics are inherited
});

// ----------------------------------------------------------------------------
// Query param schemas for delta endpoints
// ----------------------------------------------------------------------------
const PaginationParams = z.object({
  limit: z.coerce.number().int().min(1).max(2000).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

export const YearDeltaParamsSchema = PaginationParams.extend({
  level: z.enum(["insee", "section"]).default("insee"),
  inseeCode: z.string().optional(),
  section: z.string().optional(),
  year: z.coerce
    .number()
    .int()
    .describe("Comparison year (e.g. 2024)")
    .optional(),
  base_year: z.coerce
    .number()
    .int()
    .describe("Base year (e.g. 2023)")
    .optional(),
  metric: z
    .enum([
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
    ])
    .optional()
    .describe("If provided, limit sorting/filters to this metric"),
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
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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

// ----------------------------------------------------------------------------
// Type exports
// ----------------------------------------------------------------------------
export type YearlyDeltasMetrics = z.infer<typeof YearlyDeltasMetrics>;
export type YearlyDeltasByInsee = z.infer<typeof YearlyDeltasByInseeSchema>;
export type YearlyDeltasBySection = z.infer<typeof YearlyDeltasBySectionSchema>;
export type YearDeltaParams = z.infer<typeof YearDeltaParamsSchema>;
