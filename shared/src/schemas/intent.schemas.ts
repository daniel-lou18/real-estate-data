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

export const NumericFilterSchema = z
  .record(
    z.string(),
    z.object({
      operation: NumericFilterOperation,
      value: NumericFilterValueSchema,
    })
  )
  .refine(
    (filters) => {
      const keys = Object.keys(filters);
      return keys.every((key) => METRIC_FIELDS.includes(key as any));
    },
    {
      message: "Filter keys must be one of the allowed filter keys",
    }
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
