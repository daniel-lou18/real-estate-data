import { z } from "zod";
import {
  FEATURE_LEVELS,
  FEATURE_YEARS,
  METRIC_FIELDS,
  PROPERTY_TYPES,
} from "./constants";
import type { MetricField } from "./types";

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

// ----------------------------------------------------------------------------
// Shared metric schemas for MV responses
// ----------------------------------------------------------------------------

export const AggregateMetricsMV = z.object<
  Record<MetricField, z.ZodType<number>>
>({
  // Counts and totals
  total_sales: z.coerce.number().int().describe("Total number of transactions"),
  total_price: z.coerce.number().describe("Sum of transaction prices"),
  avg_price: z.coerce.number().describe("Average transaction price"),

  // Areas
  total_area: z.coerce.number().describe("Sum of area for the group"),
  avg_area: z.coerce.number().describe("Average area for the group"),

  // Weighted price per m²
  avg_price_m2: z.coerce
    .number()
    .describe("SUM(price) / NULLIF(SUM(area), 0) at group level"),

  // Distribution statistics
  min_price: z.coerce.number(),
  max_price: z.coerce.number(),
  median_price: z.coerce.number(),
  median_area: z.coerce.number(),
  min_price_m2: z.coerce.number(),
  max_price_m2: z.coerce.number(),
  price_m2_p25: z.coerce.number(),
  price_m2_p75: z.coerce.number(),
  price_m2_iqr: z.coerce.number(),
  price_m2_stddev: z.coerce.number(),
});

// Apartment composition
export const ApartmentComposition = z.object({
  total_apartments: z.coerce.number().int(),
  apartment_1_room: z.coerce.number().int(),
  apartment_2_room: z.coerce.number().int(),
  apartment_3_room: z.coerce.number().int(),
  apartment_4_room: z.coerce.number().int(),
  apartment_5_room: z.coerce.number().int(),
});

// House composition
export const HouseComposition = z.object({
  total_houses: z.coerce.number().int(),
  house_1_room: z.coerce.number().int(),
  house_2_room: z.coerce.number().int(),
  house_3_room: z.coerce.number().int(),
  house_4_room: z.coerce.number().int(),
  house_5_room: z.coerce.number().int(),
});

export const PaginationParams = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional().default(200),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export type SortOrder = z.infer<typeof SortOrderSchema>;
export type PaginationParams = z.infer<typeof PaginationParams>;
