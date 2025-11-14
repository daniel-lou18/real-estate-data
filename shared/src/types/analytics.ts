import type * as schemas from "../schemas";
import { z } from "zod";

export type SalesByInseeCode = z.infer<typeof schemas.SalesByInseeCodeSchema>;
export type SalesByInseeCodeAndSection = z.infer<
  typeof schemas.SalesByInseeCodeAndSectionSchema
>;
export type SalesByPropertyType = z.infer<
  typeof schemas.SalesByPropertyTypeSchema
>;
export type SalesByYear = z.infer<typeof schemas.SalesByYearSchema>;
export type SalesByMonth = z.infer<typeof schemas.SalesByMonthSchema>;
export type SalesSummary = z.infer<typeof schemas.SalesSummarySchema>;
export type PricePerM2Deciles = z.infer<typeof schemas.PricePerM2DecilesSchema>;

export type BaseQueryParams = z.infer<typeof schemas.BaseQueryParamsSchema>;
export type AnalyticsQueryParams = z.infer<
  typeof schemas.AnalyticsQueryParamsSchema
>;
