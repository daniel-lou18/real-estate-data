export const METRIC_FIELDS = [
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

export const COMPOSITION_FIELDS = [
  "total_apartments",
  "apartment_1_room",
  "apartment_2_room",
  "apartment_3_room",
  "apartment_4_room",
  "apartment_5_room",
] as const;

export const HOUSE_COMPOSITION_FIELDS = [
  "total_houses",
  "house_1_room",
  "house_2_room",
  "house_3_room",
  "house_4_room",
  "house_5_room",
] as const;
