import { z } from "zod";

// ----------------------------------------------------------------------------
// Shared metric schemas for MV responses
// ----------------------------------------------------------------------------

export const AggregateMetricsMV = z.object({
  // Counts and totals
  total_sales: z.number().int().describe("Total number of transactions"),
  total_price: z.number().describe("Sum of transaction prices"),
  avg_price: z.number().describe("Average transaction price"),

  // Areas
  total_area: z.number().describe("Sum of area for the group"),
  avg_area: z.number().describe("Average area for the group"),

  // Weighted price per m²
  avg_price_m2: z
    .number()
    .describe("SUM(price) / NULLIF(SUM(area), 0) at group level"),

  // Distribution statistics
  min_price: z.number(),
  max_price: z.number(),
  median_price: z.number(),
  median_area: z.number(),
  min_price_m2: z.number(),
  max_price_m2: z.number(),
  price_m2_p25: z.number(),
  price_m2_p75: z.number(),
  price_m2_iqr: z.number(),
  price_m2_stddev: z.number(),
});

// Apartment composition
const ApartmentComposition = z.object({
  total_apartments: z.number().int(),
  apartment_1_room: z.number().int(),
  apartment_2_room: z.number().int(),
  apartment_3_room: z.number().int(),
  apartment_4_room: z.number().int(),
  apartment_5_room: z.number().int(),
});

// House composition
const HouseComposition = z.object({
  total_houses: z.number().int(),
  house_1_room: z.number().int(),
  house_2_room: z.number().int(),
  house_3_room: z.number().int(),
  house_4_room: z.number().int(),
  house_5_room: z.number().int(),
});

// ----------------------------------------------------------------------------
// Linear regression slope metrics (12-month trailing window)
// ----------------------------------------------------------------------------

const RegressionWindowMeta = z.object({
  window_months: z.number().int().min(1).max(12),
  window_start_year: z.number().int().nullable(),
  window_start_month: z.number().int().min(1).max(12).nullable(),
});

const AggregateSlopeMetricsMV = z.object({
  total_sales_slope: z.number().nullable(),
  total_price_slope: z.number().nullable(),
  avg_price_slope: z.number().nullable(),
  total_area_slope: z.number().nullable(),
  avg_area_slope: z.number().nullable(),
  avg_price_m2_slope: z.number().nullable(),
  min_price_slope: z.number().nullable(),
  max_price_slope: z.number().nullable(),
  median_price_slope: z.number().nullable(),
  median_area_slope: z.number().nullable(),
  min_price_m2_slope: z.number().nullable(),
  max_price_m2_slope: z.number().nullable(),
  price_m2_p25_slope: z.number().nullable(),
  price_m2_p75_slope: z.number().nullable(),
  price_m2_iqr_slope: z.number().nullable(),
  price_m2_stddev_slope: z.number().nullable(),
});

const ApartmentCompositionSlope = z.object({
  total_apartments_slope: z.number().nullable(),
  apartment_1_room_slope: z.number().nullable(),
  apartment_2_room_slope: z.number().nullable(),
  apartment_3_room_slope: z.number().nullable(),
  apartment_4_room_slope: z.number().nullable(),
  apartment_5_room_slope: z.number().nullable(),
});

const HouseCompositionSlope = z.object({
  total_houses_slope: z.number().nullable(),
  house_1_room_slope: z.number().nullable(),
  house_2_room_slope: z.number().nullable(),
  house_3_room_slope: z.number().nullable(),
  house_4_room_slope: z.number().nullable(),
  house_5_room_slope: z.number().nullable(),
});

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...ApartmentComposition.shape,
});

export const HousesByInseeMonthSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...HouseComposition.shape,
});

export const ApartmentsByInseeMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...AggregateSlopeMetricsMV.shape,
  ...ApartmentCompositionSlope.shape,
});

export const HousesByInseeMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...AggregateSlopeMetricsMV.shape,
  ...HouseCompositionSlope.shape,
});

// ----------------------------------------------------------------------------
// Yearly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeYearSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  year: z.number().int(),
  ...ApartmentComposition.shape,
});

export const HousesByInseeYearSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  year: z.number().int(),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  iso_year: z.number().int(),
  iso_week: z.number().int().min(1).max(53),
  ...ApartmentComposition.shape,
});

export const HousesByInseeWeekSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  iso_year: z.number().int(),
  iso_week: z.number().int().min(1).max(53),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionMonthSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...ApartmentComposition.shape,
});

export const HousesBySectionMonthSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...HouseComposition.shape,
});

export const ApartmentsBySectionMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...AggregateSlopeMetricsMV.shape,
  ...ApartmentCompositionSlope.shape,
});

export const HousesBySectionMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  ...AggregateSlopeMetricsMV.shape,
  ...HouseCompositionSlope.shape,
});

// ----------------------------------------------------------------------------
// Yearly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionYearSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.number().int(),
  ...ApartmentComposition.shape,
});

export const HousesBySectionYearSchema = AggregateMetricsMV.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.number().int(),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Query param schemas (MV-focused)
// ----------------------------------------------------------------------------

const PaginationParams = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional().default(200),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const SortBySchema = z.enum([
  // Dimensional fields
  "inseeCode",
  "section",
  "year",
  "month",
  "iso_year",
  "iso_week",
  // Metric fields
  "total_sales",
  "avg_price_m2",
  "total_price",
  "avg_price",
]);
export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

const slopeSortValues = [
  "inseeCode",
  "section",
  "year",
  "month",
  "window_start_year",
  "window_start_month",
  "window_months",
  "total_sales_slope",
  "total_price_slope",
  "avg_price_slope",
  "total_area_slope",
  "avg_area_slope",
  "avg_price_m2_slope",
  "min_price_slope",
  "max_price_slope",
  "median_price_slope",
  "median_area_slope",
  "min_price_m2_slope",
  "max_price_m2_slope",
  "price_m2_p25_slope",
  "price_m2_p75_slope",
  "price_m2_iqr_slope",
  "price_m2_stddev_slope",
  "total_apartments_slope",
  "apartment_1_room_slope",
  "apartment_2_room_slope",
  "apartment_3_room_slope",
  "apartment_4_room_slope",
  "apartment_5_room_slope",
  "total_houses_slope",
  "house_1_room_slope",
  "house_2_room_slope",
  "house_3_room_slope",
  "house_4_room_slope",
  "house_5_room_slope",
] as const;

export const SlopeSortBySchema = z.enum(slopeSortValues);

export const InseeMonthParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const InseeYearParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});

export const InseeWeekParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  iso_year: z.coerce.number().int().optional(),
  iso_week: z.coerce.number().int().min(1).max(53).optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: SortOrderSchema,
});

export const SectionMonthParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  section: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const SectionYearParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  section: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});

export const InseeMonthSlopeParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sortBy: SlopeSortBySchema.optional().default("month"),
  sortOrder: SortOrderSchema.optional().default("desc"),
});

export const SectionMonthSlopeParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  section: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sortBy: SlopeSortBySchema.optional().default("month"),
  sortOrder: SortOrderSchema.optional().default("desc"),
});
// ----------------------------------------------------------------------------
// Type exports
// ----------------------------------------------------------------------------

export type AggregateMetricsMV = z.infer<typeof AggregateMetricsMV>;
export type ApartmentsByInseeMonth = z.infer<
  typeof ApartmentsByInseeMonthSchema
>;
export type HousesByInseeMonth = z.infer<typeof HousesByInseeMonthSchema>;
export type ApartmentsByInseeMonthSlope = z.infer<
  typeof ApartmentsByInseeMonthSlopeSchema
>;
export type HousesByInseeMonthSlope = z.infer<
  typeof HousesByInseeMonthSlopeSchema
>;
export type ApartmentsByInseeYear = z.infer<typeof ApartmentsByInseeYearSchema>;
export type HousesByInseeYear = z.infer<typeof HousesByInseeYearSchema>;
export type ApartmentsByInseeWeek = z.infer<typeof ApartmentsByInseeWeekSchema>;
export type HousesByInseeWeek = z.infer<typeof HousesByInseeWeekSchema>;
export type ApartmentsBySectionYear = z.infer<
  typeof ApartmentsBySectionYearSchema
>;
export type HousesBySectionYear = z.infer<typeof HousesBySectionYearSchema>;
export type ApartmentsBySectionMonth = z.infer<
  typeof ApartmentsBySectionMonthSchema
>;
export type HousesBySectionMonth = z.infer<typeof HousesBySectionMonthSchema>;
export type ApartmentsBySectionMonthSlope = z.infer<
  typeof ApartmentsBySectionMonthSlopeSchema
>;
export type HousesBySectionMonthSlope = z.infer<
  typeof HousesBySectionMonthSlopeSchema
>;

export type InseeMonthParams = z.infer<typeof InseeMonthParamsSchema>;
export type InseeYearParams = z.infer<typeof InseeYearParamsSchema>;
export type InseeWeekParams = z.infer<typeof InseeWeekParamsSchema>;
export type SectionMonthParams = z.infer<typeof SectionMonthParamsSchema>;
export type SectionYearParams = z.infer<typeof SectionYearParamsSchema>;
export type SortBy = z.infer<typeof SortBySchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;
export type InseeMonthSlopeParams = z.infer<typeof InseeMonthSlopeParamsSchema>;
export type SectionMonthSlopeParams = z.infer<
  typeof SectionMonthSlopeParamsSchema
>;
export type SlopeSortBy = z.infer<typeof SlopeSortBySchema>;
