export const DIMENSION_FIELDS = [
  "inseeCode",
  "section",
  "year",
  "month",
  "iso_year",
  "iso_week",
] as const;

export const DIMENSION_CATEGORIES = ["spatial", "temporal"] as const;

export const FEATURE_YEARS = [
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
] as const;

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const ISO_WEEKS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
] as const;

export const FEATURE_LEVELS = ["commune", "section"] as const;

export const PROPERTY_TYPES = ["house", "apartment"] as const;

export const APARTMENT_COMPOSITION_FIELDS = [
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
