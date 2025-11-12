// ----------------------------------------------------------------------------
// Centralized metric lists
// ----------------------------------------------------------------------------

export const AGG_METRICS = [
  "total_sales",
  "total_price",
  "avg_price",
  "total_area",
  "avg_area",
  "avg_price_m2",
  "min_price",
  "max_price",
  "median_price",
  "median_area",
  "min_price_m2",
  "max_price_m2",
  "price_m2_p25",
  "price_m2_p75",
  "price_m2_iqr",
  "price_m2_stddev",
] as const;

export const APARTMENT_COMPOSITION_METRICS = [
  "total_apartments",
  "apartment_1_room",
  "apartment_2_room",
  "apartment_3_room",
  "apartment_4_room",
  "apartment_5_room",
] as const;

export const HOUSE_COMPOSITION_METRICS = [
  "total_houses",
  "house_1_room",
  "house_2_room",
  "house_3_room",
  "house_4_room",
  "house_5_room",
] as const;

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

export type AggregateMetrics = (typeof AGG_METRICS)[number];
export type ApartmentCompositionMetrics =
  (typeof APARTMENT_COMPOSITION_METRICS)[number];
export type HouseCompositionMetrics =
  (typeof HOUSE_COMPOSITION_METRICS)[number];
export type DoublePrecisionMetrics = (typeof DOUBLE_PRECISION_METRICS)[number];
