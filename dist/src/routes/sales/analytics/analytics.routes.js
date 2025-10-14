import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import { AnalyticsQueryParamsSchema, SalesByInseeCodeSchema, SalesByMonthSchema, SalesByPropertyTypeSchema, SalesByInseeCodeAndSectionSchema, SalesByYearSchema, SalesSummarySchema, PricePerM2DecilesSchema, PricePerM2DecilesByInseeCodeSchema, PricePerM2DecilesByInseeCodeAndSectionSchema, } from "./analytics.schemas";
const tags = ["Analytics"];
export const groupedByInseeCode = createRoute({
    tags,
    method: "get",
    path: "/by-insee-code",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SalesByInseeCodeSchema), "List of analytics aggregated by insee code"),
    },
});
export const groupedByInseeCodeAndSection = createRoute({
    tags,
    method: "get",
    path: "/by-insee-code-section",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SalesByInseeCodeAndSectionSchema), "List of analytics aggregated by insee code and section"),
    },
});
export const groupedByPropertyType = createRoute({
    tags,
    method: "get",
    path: "/by-property-type",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SalesByPropertyTypeSchema), "List of analytics aggregated by property type"),
    },
});
export const groupedByYear = createRoute({
    tags,
    method: "get",
    path: "/by-year",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SalesByYearSchema), "List of analytics aggregated by year"),
    },
});
export const groupedByMonth = createRoute({
    tags,
    method: "get",
    path: "/by-month",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(SalesByMonthSchema), "List of analytics aggregated by month"),
    },
});
export const summary = createRoute({
    tags,
    method: "get",
    path: "/summary",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(SalesSummarySchema, "Summary of analytics"),
    },
});
export const pricePerM2Deciles = createRoute({
    tags,
    method: "get",
    path: "/price-per-m2-deciles",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(PricePerM2DecilesSchema, "Price per m2 deciles"),
    },
});
export const pricePerM2DecilesByInseeCode = createRoute({
    tags,
    method: "get",
    path: "/price-per-m2-deciles/by-insee-code",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(PricePerM2DecilesByInseeCodeSchema, "Price per m2 deciles by insee code"),
    },
});
export const pricePerM2DecilesByInseeCodeAndSection = createRoute({
    tags,
    method: "get",
    path: "/price-per-m2-deciles/by-insee-code-and-section",
    request: {
        query: AnalyticsQueryParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(PricePerM2DecilesByInseeCodeAndSectionSchema, "Price per m2 deciles by insee code and section"),
    },
});
