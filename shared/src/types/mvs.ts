import { z } from "zod";
import * as schemas from "../schemas/";

export type AggregateMetricsMV = z.infer<
  typeof schemas.AggregateMetricsMVSchema
>;
export type ApartmentsByInseeMonth = z.infer<
  typeof schemas.ApartmentsByInseeMonthSchema
>;
export type HousesByInseeMonth = z.infer<
  typeof schemas.HousesByInseeMonthSchema
>;

export type ApartmentsByInseeYear = z.infer<
  typeof schemas.ApartmentsByInseeYearSchema
>;
export type HousesByInseeYear = z.infer<typeof schemas.HousesByInseeYearSchema>;
export type ApartmentsByInseeWeek = z.infer<
  typeof schemas.ApartmentsByInseeWeekSchema
>;
export type HousesByInseeWeek = z.infer<typeof schemas.HousesByInseeWeekSchema>;
export type ApartmentsBySectionYear = z.infer<
  typeof schemas.ApartmentsBySectionYearSchema
>;
export type HousesBySectionYear = z.infer<
  typeof schemas.HousesBySectionYearSchema
>;
export type ApartmentsBySectionMonth = z.infer<
  typeof schemas.ApartmentsBySectionMonthSchema
>;
export type HousesBySectionMonth = z.infer<
  typeof schemas.HousesBySectionMonthSchema
>;

export type InseeMonthParams = z.infer<typeof schemas.InseeMonthParamsSchema>;
export type InseeYearParams = z.infer<typeof schemas.InseeYearParamsSchema>;
export type InseeWeekParams = z.infer<typeof schemas.InseeWeekParamsSchema>;
export type SectionMonthParams = z.infer<
  typeof schemas.SectionMonthParamsSchema
>;
export type SectionYearParams = z.infer<typeof schemas.SectionYearParamsSchema>;
export type SortBy = z.infer<typeof schemas.SortBySchema>;

// Shared types
export type SortOrder = z.infer<typeof schemas.SortOrderSchema>;
export type PaginationParams = z.infer<typeof schemas.PaginationParamsSchema>;

// ----------------------------------------------------------------------------
// Delta
// ----------------------------------------------------------------------------
export type YearlyDeltasMetrics = z.infer<
  typeof schemas.YearlyDeltasMetricsSchema
>;
export type YearlyDeltasByInsee = z.infer<
  typeof schemas.YearlyDeltasByInseeSchema
>;
export type YearlyDeltasBySection = z.infer<
  typeof schemas.YearlyDeltasBySectionSchema
>;
export type YearDeltaParams = z.infer<typeof schemas.YearDeltaParamsSchema>;
export type MetricDelta = z.infer<typeof schemas.MetricDeltaSchema>;

// ----------------------------------------------------------------------------
// Slope
// ----------------------------------------------------------------------------

export type ApartmentsByInseeMonthSlope = z.infer<
  typeof schemas.ApartmentsByInseeMonthSlopeSchema
>;
export type HousesByInseeMonthSlope = z.infer<
  typeof schemas.HousesByInseeMonthSlopeSchema
>;

export type ApartmentsBySectionMonthSlope = z.infer<
  typeof schemas.ApartmentsBySectionMonthSlopeSchema
>;
export type HousesBySectionMonthSlope = z.infer<
  typeof schemas.HousesBySectionMonthSlopeSchema
>;

export type InseeMonthSlopeParams = z.infer<
  typeof schemas.InseeMonthSlopeParamsSchema
>;
export type SectionMonthSlopeParams = z.infer<
  typeof schemas.SectionMonthSlopeParamsSchema
>;
export type SlopeSortBy = z.infer<typeof schemas.SlopeSortBySchema>;
