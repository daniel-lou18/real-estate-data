import { createRoute } from "@hono/zod-openapi";
import {
  YearDeltaParamsSchema,
  YearlyDeltasByInseeSchema,
  YearlyDeltasBySectionSchema,
} from "./mv_deltas.schema";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import { z } from "zod";

const tags = ["MV", "Deltas"];

export const getAptsByInseeCodeYearlyDeltas = createRoute({
  tags,
  method: "get",
  path: "/apartments/by-insee-code/year/deltas",
  request: {
    query: YearDeltaParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(YearlyDeltasByInseeSchema),
      "List of apartments by insee code, year deltas"
    ),
  },
});

export const getHousesByInseeCodeYearlyDeltas = createRoute({
  tags,
  method: "get",
  path: "/houses/by-insee-code/year/deltas",
  request: {
    query: YearDeltaParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(YearlyDeltasByInseeSchema),
      "List of houses by insee code, year deltas"
    ),
  },
});

export const getAptsBySectionYearlyDeltas = createRoute({
  tags,
  method: "get",
  path: "/apartments/by-section/year/deltas",
  request: {
    query: YearDeltaParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(YearlyDeltasBySectionSchema),
      "List of apartments by section, year deltas"
    ),
  },
});

export const getHousesBySectionYearlyDeltas = createRoute({
  tags,
  method: "get",
  path: "/houses/by-section/year/deltas",
  request: {
    query: YearDeltaParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(YearlyDeltasBySectionSchema),
      "List of houses by section, year deltas"
    ),
  },
});

export type GetAptsByInseeCodeYearlyDeltasRoute =
  typeof getAptsByInseeCodeYearlyDeltas;
export type GetHousesByInseeCodeYearlyDeltasRoute =
  typeof getHousesByInseeCodeYearlyDeltas;
export type GetAptsBySectionYearlyDeltasRoute =
  typeof getAptsBySectionYearlyDeltas;
export type GetHousesBySectionYearlyDeltasRoute =
  typeof getHousesBySectionYearlyDeltas;
