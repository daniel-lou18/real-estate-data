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
    limit: z.coerce.number().int().min(1).max(500).default(200),
    offset: z.coerce.number().int().min(0).default(0),
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
