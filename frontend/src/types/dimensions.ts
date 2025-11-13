import { z } from "zod";
import type {
  DIMENSION_FIELDS,
  DIMENSION_CATEGORIES,
  FEATURE_LEVELS,
  PROPERTY_TYPES,
  FEATURE_YEARS,
  MONTHS,
  ISO_WEEKS,
} from "@/constants/base";

export type DimensionCatalogItem = {
  id: DimensionField;
  label: string;
  category: DimensionCategory;
  level?: FeatureLevel;
  type: z.ZodType<any>;
};

export type DimensionField = (typeof DIMENSION_FIELDS)[number];
export type FeatureLevel = (typeof FEATURE_LEVELS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type DimensionCategory = (typeof DIMENSION_CATEGORIES)[number];

export type Year = (typeof FEATURE_YEARS)[number];
export type Month = (typeof MONTHS)[number];
export type ISOWeek = (typeof ISO_WEEKS)[number];
