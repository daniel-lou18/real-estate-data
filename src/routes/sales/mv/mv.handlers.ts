import type { AppRouteHandler } from "@/types";
import type {
  GetAptsByInseeCodeMonthRoute,
  GetHousesByInseeCodeMonthRoute,
  GetAptsByInseeCodeYearRoute,
  GetHousesByInseeCodeYearRoute,
  GetAptsByInseeCodeWeekRoute,
  GetHousesByInseeCodeWeekRoute,
} from "./mv.routes";
import * as HttpStatusCodes from "@/config/http-status-codes";
import {
  getAptsByInseeMonth,
  getAptsByInseeWeek,
  getAptsByInseeYear,
  getHousesByInseeMonth,
  getHousesByInseeWeek,
  getHousesByInseeYear,
} from "@/repositories/mv/mv.analytics";

export const getAptsByInseeCodeYear: AppRouteHandler<
  GetAptsByInseeCodeYearRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsByInseeYear(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesByInseeCodeYear: AppRouteHandler<
  GetHousesByInseeCodeYearRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesByInseeYear(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getAptsByInseeCodeMonth: AppRouteHandler<
  GetAptsByInseeCodeMonthRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsByInseeMonth(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesByInseeCodeMonth: AppRouteHandler<
  GetHousesByInseeCodeMonthRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesByInseeMonth(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getAptsByInseeCodeWeek: AppRouteHandler<
  GetAptsByInseeCodeWeekRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsByInseeWeek(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesByInseeCodeWeek: AppRouteHandler<
  GetHousesByInseeCodeWeekRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesByInseeWeek(query);
  return c.json(results, HttpStatusCodes.OK);
};
