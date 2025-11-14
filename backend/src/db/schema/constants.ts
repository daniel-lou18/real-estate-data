/**
 * Metrics that require double precision casting (numeric fields from source views).
 */
export const DOUBLE_PRECISION_METRICS = [
  "total_price",
  "avg_price",
  "avg_price_m2",
  "median_price",
  "price_m2_p25",
  "price_m2_p75",
  "price_m2_iqr",
  "price_m2_stddev",
] as const;

export type DoublePrecisionMetrics = (typeof DOUBLE_PRECISION_METRICS)[number];
