import { z } from "zod";
import * as shared from "./shared";
import * as base from "./base";

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
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema =
  shared.AggregateMetricsMVSchema.extend({
    inseeCode: z.string(),
    iso_year: z.coerce.number().int(),
    iso_week: z.coerce.number().int().min(1).max(53),
    ...shared.ApartmentComposition.shape,
  });

export const HousesByInseeWeekSchema = shared.AggregateMetricsMVSchema.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  iso_year: base.ISO_YEAR_SCHEMA,
  iso_week: base.ISO_WEEK_SCHEMA,
  ...shared.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by section
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
  "min_price",
  "max_price",
  "min_price_m2",
  "max_price_m2",
]);
export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const InseeMonthParamsSchema = PaginationParams.extend({
  inseeCode: base.INSEE_CODE_SCHEMA.optional(),
  year: base.YEAR_SCHEMA.optional(),
  month: base.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const InseeYearParamsSchema = PaginationParams.extend({
  inseeCode: base.INSEE_CODE_SCHEMA.optional(),
  year: base.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});

export const InseeWeekParamsSchema = PaginationParams.extend({
  inseeCode: base.INSEE_CODE_SCHEMA.optional(),
  iso_year: base.ISO_YEAR_SCHEMA.optional(),
  iso_week: base.ISO_WEEK_SCHEMA.optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: SortOrderSchema,
});

export const SectionMonthParamsSchema = PaginationParams.extend({
  inseeCode: base.INSEE_CODE_SCHEMA.optional(),
  section: base.SECTION_SCHEMA.optional(),
  year: base.YEAR_SCHEMA.optional(),
  month: base.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const SectionYearParamsSchema = PaginationParams.extend({
  inseeCode: base.INSEE_CODE_SCHEMA.optional(),
  section: base.SECTION_SCHEMA.optional(),
  year: base.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});
