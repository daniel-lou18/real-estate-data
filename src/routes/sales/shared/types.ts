import {
  APARTMENT_COMPOSITION_FIELDS,
  DIMENSION_FIELDS,
  HOUSE_COMPOSITION_FIELDS,
  METRIC_FIELDS,
  FEATURE_YEARS,
  MONTHS,
  FEATURE_LEVELS,
  PROPERTY_TYPES,
} from "./constants";

export type MetricField = (typeof METRIC_FIELDS)[number];
export type ApartmentCompositionField =
  (typeof APARTMENT_COMPOSITION_FIELDS)[number];
export type HouseCompositionField = (typeof HOUSE_COMPOSITION_FIELDS)[number];
export type DimensionField = (typeof DIMENSION_FIELDS)[number];
export type Year = (typeof FEATURE_YEARS)[number];
export type Month = (typeof MONTHS)[number];
export type FeatureLevel = (typeof FEATURE_LEVELS)[number];
export type PropertyTypeField = (typeof PROPERTY_TYPES)[number];
