import { z } from "zod";
import * as schemas from "../schemas/";

// ----------------------------------------------------------------------------
// Yearly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeYearSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesByInseeYearSchema = schemas.AggregateMetricsMVSchema.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesByInseeMonthSchema = schemas.AggregateMetricsMVSchema.extend(
  {
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.HouseComposition.shape,
  }
);

// ----------------------------------------------------------------------------
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    iso_year: schemas.ISO_YEAR_SCHEMA,
    iso_week: schemas.ISO_WEEK_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesByInseeWeekSchema = schemas.AggregateMetricsMVSchema.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  iso_year: schemas.ISO_YEAR_SCHEMA,
  iso_week: schemas.ISO_WEEK_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by Section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionMonthSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesBySectionMonthSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.HouseComposition.shape,
  });

// ----------------------------------------------------------------------------
// Yearly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionYearSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesBySectionYearSchema =
  schemas.AggregateMetricsMVSchema.extend({
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

export const InseeMonthParamsSchema = schemas.PaginationParamsSchema.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  month: schemas.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: schemas.SortOrderSchema,
});

export const InseeYearParamsSchema = schemas.PaginationParamsSchema.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: schemas.SortOrderSchema,
});

export const InseeWeekParamsSchema = schemas.PaginationParamsSchema.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  iso_year: schemas.ISO_YEAR_SCHEMA.optional(),
  iso_week: schemas.ISO_WEEK_SCHEMA.optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: schemas.SortOrderSchema,
});

export const SectionMonthParamsSchema = schemas.PaginationParamsSchema.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  section: schemas.SECTION_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  month: schemas.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: schemas.SortOrderSchema,
});

export const SectionYearParamsSchema = schemas.PaginationParamsSchema.extend({
  inseeCode: schemas.INSEE_CODE_ARRAY_SCHEMA,
  section: schemas.SECTION_ARRAY_SCHEMA,
  year: schemas.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: schemas.SortOrderSchema,
});

// ----------------------------------------------------------------------------
// Type exports
// ----------------------------------------------------------------------------
