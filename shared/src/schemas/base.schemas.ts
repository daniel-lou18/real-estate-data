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

export const INSEE_CODE_ARRAY_SCHEMA = z
  .array(INSEE_CODE_SCHEMA)
  .min(0)
  .max(100)
  .optional()
  .describe(
    "INSEE code(s) for the commune(s). Array of 5-digit codes, e.g. ['75112', '75113']. Omit for no filtering."
  );

export const SECTION_ARRAY_SCHEMA = z
  .array(SECTION_SCHEMA)
  .min(0)
  .max(100)
  .optional()
  .describe(
    "Section identifier(s) within the commune(s). Array of 10-character identifiers, e.g. ['75112000BZ', '75107000AY']. Omit for no filtering."
  );

/**
 * Preprocessed version of INSEE_CODE_ARRAY_SCHEMA that accepts comma-separated strings.
 * Can parse strings like "75112,75113" into ["75112", "75113"].
 * Also accepts arrays directly.
 */
export const INSEE_CODE_ARRAY_PREPROCESSED_SCHEMA = z
  .union([
    INSEE_CODE_ARRAY_SCHEMA,
    z.string().transform((val) => {
      const split = val
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      // Return empty array if no valid items (will be handled by optional if needed)
      return split;
    }),
  ])
  .pipe(INSEE_CODE_ARRAY_SCHEMA);

/**
 * Preprocessed version of SECTION_ARRAY_SCHEMA that accepts comma-separated strings.
 * Can parse strings like "75112000BZ,75107000AY" into ["75112000BZ", "75107000AY"].
 * Also accepts arrays directly.
 */
export const SECTION_ARRAY_PREPROCESSED_SCHEMA = z
  .union([
    SECTION_ARRAY_SCHEMA,
    z.string().transform((val) => {
      const split = val
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      // Return empty array if no valid items (will be handled by optional if needed)
      return split;
    }),
  ])
  .pipe(SECTION_ARRAY_SCHEMA);

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
