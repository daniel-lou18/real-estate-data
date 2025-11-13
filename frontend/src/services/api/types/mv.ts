import { z } from "zod";
import * as mvSchemas from "../schemas";
import type * as mvDeltasSchemas from "../schemas/mv_deltas.schemas";

export type ApartmentsByInseeMonth = z.infer<
  typeof mvSchemas.ApartmentsByInseeMonthSchema
>;
export type HousesByInseeMonth = z.infer<
  typeof mvSchemas.HousesByInseeMonthSchema
>;
export type ApartmentsByInseeYear = z.infer<
  typeof mvSchemas.ApartmentsByInseeYearSchema
>;
export type HousesByInseeYear = z.infer<
  typeof mvSchemas.HousesByInseeYearSchema
>;
export type ApartmentsByInseeWeek = z.infer<
  typeof mvSchemas.ApartmentsByInseeWeekSchema
>;
export type HousesByInseeWeek = z.infer<
  typeof mvSchemas.HousesByInseeWeekSchema
>;
export type ApartmentsBySectionYear = z.infer<
  typeof mvSchemas.ApartmentsBySectionYearSchema
>;
export type HousesBySectionYear = z.infer<
  typeof mvSchemas.HousesBySectionYearSchema
>;
export type ApartmentsBySectionMonth = z.infer<
  typeof mvSchemas.ApartmentsBySectionMonthSchema
>;
export type HousesBySectionMonth = z.infer<
  typeof mvSchemas.HousesBySectionMonthSchema
>;

export type InseeMonthParams = z.infer<typeof mvSchemas.InseeMonthParamsSchema>;
export type InseeYearParams = z.infer<typeof mvSchemas.InseeYearParamsSchema>;
export type InseeWeekParams = z.infer<typeof mvSchemas.InseeWeekParamsSchema>;
export type SectionMonthParams = z.infer<
  typeof mvSchemas.SectionMonthParamsSchema
>;
export type SectionYearParams = z.infer<
  typeof mvSchemas.SectionYearParamsSchema
>;
export type SortBy = z.infer<typeof mvSchemas.SortBySchema>;
export type SortOrder = z.infer<typeof mvSchemas.SortOrderSchema>;

export type MetricDelta = z.infer<typeof mvDeltasSchemas.MetricDelta>;
export type YearlyDeltasMetrics = z.infer<
  typeof mvDeltasSchemas.YearlyDeltasMetrics
>;
export type YearlyDeltasByInsee = z.infer<
  typeof mvDeltasSchemas.YearlyDeltasByInseeSchema
>;
export type YearlyDeltasBySection = z.infer<
  typeof mvDeltasSchemas.YearlyDeltasBySectionSchema
>;
export type YearDeltaParams = z.infer<
  typeof mvDeltasSchemas.YearDeltaParamsSchema
>;
