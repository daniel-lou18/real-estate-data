import type { AppRouteHandler } from "@/types";
import * as HttpStatusCodes from "@/config/http-status-codes";
import {
  getAptsByInseeMonthSlopes,
  getHousesByInseeMonthSlopes,
  getAptsBySectionMonthSlopes,
  getHousesBySectionMonthSlopes,
} from "@/repositories/mv/mv.slopes";
import type {
  GetAptsByInseeCodeMonthSlopeRoute,
  GetHousesByInseeCodeMonthSlopeRoute,
  GetAptsBySectionMonthSlopeRoute,
  GetHousesBySectionMonthSlopeRoute,
} from "./mv_slopes.routes";

export const getAptsByInseeCodeMonthSlope: AppRouteHandler<
  GetAptsByInseeCodeMonthSlopeRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsByInseeMonthSlopes(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesByInseeCodeMonthSlope: AppRouteHandler<
  GetHousesByInseeCodeMonthSlopeRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesByInseeMonthSlopes(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getAptsBySectionMonthSlope: AppRouteHandler<
  GetAptsBySectionMonthSlopeRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsBySectionMonthSlopes(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesBySectionMonthSlope: AppRouteHandler<
  GetHousesBySectionMonthSlopeRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesBySectionMonthSlopes(query);
  return c.json(results, HttpStatusCodes.OK);
};
