import { z } from "zod";
import { METRIC_FIELDS, DIMENSION_FIELDS } from "../constants/base";
import {
  METRIC_FIELD_SCHEMA,
  YEAR_SCHEMA,
  MONTH_SCHEMA,
  PROPERTY_TYPE_SCHEMA,
  SECTION_ARRAY_SCHEMA,
  INSEE_CODE_ARRAY_SCHEMA,
} from "./base.schemas";

// Numeric Filter Schemas
export const NUMERIC_FILTER_OPERATIONS = ["gte", "lte", "between"] as const;

export const NumericFilterOperation = z.enum(NUMERIC_FILTER_OPERATIONS);
export const NumericFilterValueSchema = z.union([
  z.number(),
  z.array(z.number()),
]);

// Using z.enum as record key - more elegant and type-safe
// Note: This should work with Zod v4, but may have issues with JSON Schema conversion
export const NumericFilterSchema = z.record(
  z.enum(METRIC_FIELDS),
  z.object({
    operation: NumericFilterOperation,
    value: NumericFilterValueSchema,
  })
);

export const UserIntentSchema = z.object({
  primaryDimension: z.enum(DIMENSION_FIELDS).optional(),
  inseeCodes: INSEE_CODE_ARRAY_SCHEMA,
  sections: SECTION_ARRAY_SCHEMA,
  year: YEAR_SCHEMA.optional(),
  month: MONTH_SCHEMA.optional(),
  metric: METRIC_FIELD_SCHEMA.optional(),
  propertyType: PROPERTY_TYPE_SCHEMA.optional(),
  filters: NumericFilterSchema.optional(),
  limit: z.number().int().min(1).max(500).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  minSales: z.number().int().min(0).optional(),
});
