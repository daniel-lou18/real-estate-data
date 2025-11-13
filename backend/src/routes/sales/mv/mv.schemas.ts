import { z } from "zod";
import * as schemas from "@/routes/sales/shared/schemas";

// ----------------------------------------------------------------------------
// Yearly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeYearSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  ...schemas.ApartmentComposition.shape,
});

export const HousesByInseeYearSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  month: schemas.MONTH_SCHEMA,
  ...schemas.ApartmentComposition.shape,
});

export const HousesByInseeMonthSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  month: schemas.MONTH_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  iso_year: schemas.ISO_YEAR_SCHEMA,
  iso_week: schemas.ISO_WEEK_SCHEMA,
  ...schemas.ApartmentComposition.shape,
});

export const HousesByInseeWeekSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  iso_year: schemas.ISO_YEAR_SCHEMA,
  iso_week: schemas.ISO_WEEK_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by Section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionMonthSchema = schemas.AggregateMetricsMV.extend(
  {
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  }
);

export const HousesBySectionMonthSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  section: schemas.SECTION_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  month: schemas.MONTH_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Yearly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionYearSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  section: schemas.SECTION_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  ...schemas.ApartmentComposition.shape,
});

export const HousesBySectionYearSchema = schemas.AggregateMetricsMV.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  section: schemas.SECTION_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Query param schemas (MV-focused)
// ----------------------------------------------------------------------------

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

export const InseeMonthParamsSchema = schemas.PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  month: schemas.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: schemas.SortOrderSchema,
});

export const InseeYearParamsSchema = schemas.PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: schemas.SortOrderSchema,
});

export const InseeWeekParamsSchema = schemas.PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  iso_year: schemas.ISO_YEAR_SCHEMA.optional(),
  iso_week: schemas.ISO_WEEK_SCHEMA.optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: schemas.SortOrderSchema,
});

export const SectionMonthParamsSchema = schemas.PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  section: schemas.SECTION_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  month: schemas.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: schemas.SortOrderSchema,
});

export const SectionYearParamsSchema = schemas.PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  section: schemas.SECTION_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: schemas.SortOrderSchema,
});

// ----------------------------------------------------------------------------
// Type exports
// ----------------------------------------------------------------------------
export type AggregateMetricsMV = z.infer<typeof schemas.AggregateMetricsMV>;
export type ApartmentsByInseeMonth = z.infer<
  typeof ApartmentsByInseeMonthSchema
>;
export type HousesByInseeMonth = z.infer<typeof HousesByInseeMonthSchema>;

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

export type InseeMonthParams = z.infer<typeof InseeMonthParamsSchema>;
export type InseeYearParams = z.infer<typeof InseeYearParamsSchema>;
export type InseeWeekParams = z.infer<typeof InseeWeekParamsSchema>;
export type SectionMonthParams = z.infer<typeof SectionMonthParamsSchema>;
export type SectionYearParams = z.infer<typeof SectionYearParamsSchema>;
export type SortBy = z.infer<typeof SortBySchema>;
