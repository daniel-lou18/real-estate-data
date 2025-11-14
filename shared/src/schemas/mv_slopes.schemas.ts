import { z } from "zod";
import * as shared from "./mv_shared.schemas";
import * as base from "./base.schemas";

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

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  year: base.YEAR_SCHEMA,
  month: base.MONTH_SCHEMA,
  ...AggregateSlopeMetricsMV.shape,
  ...ApartmentCompositionSlope.shape,
});

export const HousesByInseeMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  year: base.YEAR_SCHEMA,
  month: base.MONTH_SCHEMA,
  ...AggregateSlopeMetricsMV.shape,
  ...HouseCompositionSlope.shape,
});

export const ApartmentsBySectionMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  section: base.SECTION_SCHEMA,
  year: base.YEAR_SCHEMA,
  month: base.MONTH_SCHEMA,
  ...AggregateSlopeMetricsMV.shape,
  ...ApartmentCompositionSlope.shape,
});

export const HousesBySectionMonthSlopeSchema = RegressionWindowMeta.extend({
  inseeCode: base.INSEE_CODE_SCHEMA,
  section: base.SECTION_SCHEMA,
  year: base.YEAR_SCHEMA,
  month: base.MONTH_SCHEMA,
  ...AggregateSlopeMetricsMV.shape,
  ...HouseCompositionSlope.shape,
});

export const InseeMonthSlopeParamsSchema = shared.PaginationParamsSchema.extend(
  {
    inseeCode: base.INSEE_CODE_SCHEMA.optional(),
    year: base.YEAR_SCHEMA.optional(),
    month: base.MONTH_SCHEMA.optional(),
    sortBy: SlopeSortBySchema.optional().default("month"),
    sortOrder: shared.SortOrderSchema,
  }
);

export const SectionMonthSlopeParamsSchema =
  shared.PaginationParamsSchema.extend({
    inseeCode: base.INSEE_CODE_SCHEMA.optional(),
    section: base.SECTION_SCHEMA.optional(),
    year: base.YEAR_SCHEMA.optional(),
    month: base.MONTH_SCHEMA.optional(),
    sortBy: SlopeSortBySchema.optional().default("month"),
    sortOrder: shared.SortOrderSchema,
  });
