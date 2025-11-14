import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/config/http-status-codes";
import { ApartmentsByInseeMonthSchema, HousesByInseeMonthSchema, ApartmentsByInseeYearSchema, HousesByInseeYearSchema, InseeMonthParamsSchema, InseeYearParamsSchema, InseeWeekParamsSchema, HousesByInseeWeekSchema, ApartmentsByInseeWeekSchema, SectionYearParamsSchema, ApartmentsBySectionYearSchema, HousesBySectionYearSchema, SectionMonthParamsSchema, ApartmentsBySectionMonthSchema, HousesBySectionMonthSchema, } from "@app/shared";
import jsonContent from "@/openapi/helpers/json-content";
const tags = ["MV"];
export const getAptsByInseeCodeYear = createRoute({
    tags,
    method: "get",
    path: "/apartments/by-insee-code/year",
    request: {
        query: InseeYearParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(ApartmentsByInseeYearSchema), "List of apartments by insee code, year"),
    },
});
export const getHousesByInseeCodeYear = createRoute({
    tags,
    method: "get",
    path: "/houses/by-insee-code/year",
    request: {
        query: InseeYearParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(HousesByInseeYearSchema), "List of houses by insee code, year"),
    },
});
export const getAptsByInseeCodeMonth = createRoute({
    tags,
    method: "get",
    path: "/apartments/by-insee-code/month",
    request: {
        query: InseeMonthParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(ApartmentsByInseeMonthSchema), "List of apartments by insee code, year, month"),
    },
});
export const getHousesByInseeCodeMonth = createRoute({
    tags,
    method: "get",
    path: "/houses/by-insee-code/month",
    request: {
        query: InseeMonthParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(HousesByInseeMonthSchema), "List of houses by insee code, year, month"),
    },
});
export const getAptsByInseeCodeWeek = createRoute({
    tags,
    method: "get",
    path: "/apartments/by-insee-code/week",
    request: {
        query: InseeWeekParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(ApartmentsByInseeWeekSchema), "List of apartments by insee code, year, week"),
    },
});
export const getHousesByInseeCodeWeek = createRoute({
    tags,
    method: "get",
    path: "/houses/by-insee-code/week",
    request: {
        query: InseeWeekParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(HousesByInseeWeekSchema), "List of houses by insee code, year, week"),
    },
});
export const getAptsBySectionYear = createRoute({
    tags,
    method: "get",
    path: "/apartments/by-section/year",
    request: {
        query: SectionYearParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(ApartmentsBySectionYearSchema), "List of apartments by section, year"),
    },
});
export const getHousesBySectionYear = createRoute({
    tags,
    method: "get",
    path: "/houses/by-section/year",
    request: {
        query: SectionYearParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(HousesBySectionYearSchema), "List of houses by section, year"),
    },
});
export const getAptsBySectionMonth = createRoute({
    tags,
    method: "get",
    path: "/apartments/by-section/month",
    request: {
        query: SectionMonthParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(ApartmentsBySectionMonthSchema), "List of apartments by section, year, month"),
    },
});
export const getHousesBySectionMonth = createRoute({
    tags,
    method: "get",
    path: "/houses/by-section/month",
    request: {
        query: SectionMonthParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(HousesBySectionMonthSchema), "List of houses by section, year, month"),
    },
});
