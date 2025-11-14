import { z } from "zod";
import * as shared from "./mv_shared.schemas";
import * as base from "./base.schemas";

// ----------------------------------------------------------------------------
// Yearly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeYearSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA,
    year: base.YEAR_SCHEMA,
    ...shared.ApartmentComposition.shape,
  });

export const HousesByInseeYearSchema = shared.AggregateMetricsMVSchema.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  year: base.YEAR_SCHEMA,
  ...shared.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA,
    year: base.YEAR_SCHEMA,
    month: base.MONTH_SCHEMA,
    ...shared.ApartmentComposition.shape,
  });

export const HousesByInseeMonthSchema = shared.AggregateMetricsMVSchema.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  year: base.YEAR_SCHEMA,
  month: base.MONTH_SCHEMA,
  ...shared.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA,
    iso_year: base.ISO_YEAR_SCHEMA,
    iso_week: base.ISO_WEEK_SCHEMA,
    ...shared.ApartmentComposition.shape,
  });

export const HousesByInseeWeekSchema = shared.AggregateMetricsMVSchema.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  iso_year: base.ISO_YEAR_SCHEMA,
  iso_week: base.ISO_WEEK_SCHEMA,
  ...shared.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by Section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionMonthSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA,
    section: base.SECTION_SCHEMA,
    year: base.YEAR_SCHEMA,
    month: base.MONTH_SCHEMA,
    ...shared.ApartmentComposition.shape,
  });

export const HousesBySectionMonthSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA,
    section: base.SECTION_SCHEMA,
    year: base.YEAR_SCHEMA,
    month: base.MONTH_SCHEMA,
    ...shared.HouseComposition.shape,
  });

// ----------------------------------------------------------------------------
// Yearly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionYearSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA,
    section: base.SECTION_SCHEMA,
    year: base.YEAR_SCHEMA,
    ...shared.ApartmentComposition.shape,
  });

export const HousesBySectionYearSchema = shared.AggregateMetricsMVSchema.extend(
  {
    inseeCode: base.INSEE_CODE_SCHEMA,
    section: base.SECTION_SCHEMA,
    year: base.YEAR_SCHEMA,
    ...shared.HouseComposition.shape,
  }
);

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

export const InseeMonthParamsSchema = shared.PaginationParamsSchema.extend({
  inseeCodes: base.INSEE_CODE_ARRAY_PREPROCESSED_SCHEMA,
  year: base.YEAR_SCHEMA.optional(),
  month: base.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: shared.SortOrderSchema,
});

export const InseeYearParamsSchema = shared.PaginationParamsSchema.extend({
  inseeCodes: base.INSEE_CODE_ARRAY_PREPROCESSED_SCHEMA,
  year: base.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: shared.SortOrderSchema,
});

export const InseeWeekParamsSchema = shared.PaginationParamsSchema.extend({
  inseeCodes: base.INSEE_CODE_ARRAY_PREPROCESSED_SCHEMA,
  iso_year: base.ISO_YEAR_SCHEMA.optional(),
  iso_week: base.ISO_WEEK_SCHEMA.optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: shared.SortOrderSchema,
});

export const SectionMonthParamsSchema = shared.PaginationParamsSchema.extend({
  inseeCodes: base.INSEE_CODE_ARRAY_PREPROCESSED_SCHEMA,
  sections: base.SECTION_ARRAY_PREPROCESSED_SCHEMA,
  year: base.YEAR_SCHEMA.optional(),
  month: base.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: shared.SortOrderSchema,
});

export const SectionYearParamsSchema = shared.PaginationParamsSchema.extend({
  inseeCodes: base.INSEE_CODE_ARRAY_PREPROCESSED_SCHEMA,
  sections: base.SECTION_ARRAY_PREPROCESSED_SCHEMA,
  year: base.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: shared.SortOrderSchema,
});
