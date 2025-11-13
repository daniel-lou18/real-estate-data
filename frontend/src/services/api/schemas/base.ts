import {
  FEATURE_LEVELS,
  FEATURE_YEARS,
  ISO_WEEKS,
  METRIC_FIELDS,
  MONTHS,
  PROPERTY_TYPES,
} from "@/constants/base";
import { z } from "zod";

export const INSEE_CODE_SCHEMA = z
  .string()
  .length(5)
  .describe("INSEE code for the commune");
export const SECTION_SCHEMA = z
  .string()
  .length(10)
  .describe("Section identifier within the commune");

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
export const MONTH_SCHEMA = z.coerce
  .number()
  .int()
  .min(MONTHS[0])
  .max(MONTHS[MONTHS.length - 1]);
export const ISO_YEAR_SCHEMA = z.coerce
  .number()
  .int()
  .min(FEATURE_YEARS[0])
  .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]);
export const ISO_WEEK_SCHEMA = z.coerce
  .number()
  .int()
  .min(ISO_WEEKS[0])
  .max(ISO_WEEKS[ISO_WEEKS.length - 1]);

export const LEVEL_SCHEMA = z.enum(FEATURE_LEVELS).default("commune");
export const PROPERTY_TYPE_SCHEMA = z.enum(PROPERTY_TYPES).default("apartment");

export const METRIC_FIELD_SCHEMA = z
  .enum(METRIC_FIELDS)
  .default("avg_price_m2");

export const FilterStateSchema = z.object({
  level: LEVEL_SCHEMA,
  inseeCodes: z.array(INSEE_CODE_SCHEMA).optional(),
  sections: z.array(SECTION_SCHEMA).optional(),
  year: YEAR_SCHEMA.optional(),
  month: MONTH_SCHEMA.optional(),
  iso_year: ISO_YEAR_SCHEMA.optional(),
  iso_week: ISO_WEEK_SCHEMA.optional(),
  propertyType: PROPERTY_TYPE_SCHEMA.default("apartment"),
  metric: METRIC_FIELD_SCHEMA.optional(),
});
