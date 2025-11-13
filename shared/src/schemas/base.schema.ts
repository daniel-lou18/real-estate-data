import { z } from "zod";
import {
  FEATURE_LEVELS,
  FEATURE_YEARS,
  METRIC_FIELDS,
  PROPERTY_TYPES,
} from "../constants/base";

export const INSEE_CODE_SCHEMA = z
  .string()
  .length(5)
  .describe("INSEE code for the commune, e.g. '75112'");
export const SECTION_SCHEMA = z
  .string()
  .length(10)
  .describe("Section identifier within the commune, e.g. '75112000BZ'");

// Array variants that accept both single values and arrays (for backward compatibility)
export const INSEE_CODE_ARRAY_SCHEMA = z
  .union([INSEE_CODE_SCHEMA, z.array(INSEE_CODE_SCHEMA).min(1).max(100)])
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined;
    return Array.isArray(val) ? val : [val];
  })
  .describe(
    "INSEE code(s) for the commune(s). Can be a single code or an array, e.g. '75112' or ['75112', '75113']"
  );

export const SECTION_ARRAY_SCHEMA = z
  .union([SECTION_SCHEMA, z.array(SECTION_SCHEMA).min(1).max(100)])
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined;
    return Array.isArray(val) ? val : [val];
  })
  .describe(
    "Section identifier(s) within the commune(s). Can be a single section or an array, e.g. '75112000BZ' or ['75112000BZ', '75107000AY']"
  );

export const YEAR_SCHEMA = z.coerce
  .number()
  .int()
  .min(FEATURE_YEARS[0])
  .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]);
export const MONTH_SCHEMA = z.coerce.number().int().min(1).max(12);
export const ISO_YEAR_SCHEMA = z.coerce
  .number()
  .int()
  .min(FEATURE_YEARS[0])
  .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]);
export const ISO_WEEK_SCHEMA = z.coerce.number().int().min(1).max(53);

export const LEVEL_SCHEMA = z.enum(FEATURE_LEVELS).default("commune");
export const PROPERTY_TYPE_SCHEMA = z.enum(PROPERTY_TYPES).default("apartment");

export const METRIC_FIELD_SCHEMA = z
  .enum(METRIC_FIELDS)
  .default("avg_price_m2");

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
