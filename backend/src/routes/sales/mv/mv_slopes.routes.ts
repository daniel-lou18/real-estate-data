import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import {
  ApartmentsByInseeMonthSlopeSchema,
  HousesByInseeMonthSlopeSchema,
  ApartmentsBySectionMonthSlopeSchema,
  HousesBySectionMonthSlopeSchema,
  InseeMonthSlopeParamsSchema,
  SectionMonthSlopeParamsSchema,
} from "@app/shared";

const tags = ["MV"];

export const getAptsByInseeCodeMonthSlope = createRoute({
  tags,
  method: "get",
  path: "/apartments/by-insee-code/month/slope",
  request: {
    query: InseeMonthSlopeParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(ApartmentsByInseeMonthSlopeSchema),
      "12-month regression slopes for apartments by insee code, month"
    ),
  },
});

export const getHousesByInseeCodeMonthSlope = createRoute({
  tags,
  method: "get",
  path: "/houses/by-insee-code/month/slope",
  request: {
    query: InseeMonthSlopeParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(HousesByInseeMonthSlopeSchema),
      "12-month regression slopes for houses by insee code, month"
    ),
  },
});

export const getAptsBySectionMonthSlope = createRoute({
  tags,
  method: "get",
  path: "/apartments/by-section/month/slope",
  request: {
    query: SectionMonthSlopeParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(ApartmentsBySectionMonthSlopeSchema),
      "12-month regression slopes for apartments by section, month"
    ),
  },
});

export const getHousesBySectionMonthSlope = createRoute({
  tags,
  method: "get",
  path: "/houses/by-section/month/slope",
  request: {
    query: SectionMonthSlopeParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(HousesBySectionMonthSlopeSchema),
      "12-month regression slopes for houses by section, month"
    ),
  },
});

export type GetAptsByInseeCodeMonthSlopeRoute =
  typeof getAptsByInseeCodeMonthSlope;
export type GetHousesByInseeCodeMonthSlopeRoute =
  typeof getHousesByInseeCodeMonthSlope;
export type GetAptsBySectionMonthSlopeRoute = typeof getAptsBySectionMonthSlope;
export type GetHousesBySectionMonthSlopeRoute =
  typeof getHousesBySectionMonthSlope;
