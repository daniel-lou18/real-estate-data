import type { AppRouteHandler } from "@/types";
import type {
  GetAptsByInseeCodeMonthRoute,
  GetHousesByInseeCodeMonthRoute,
  GetAptsByInseeCodeYearRoute,
  GetHousesByInseeCodeYearRoute,
  GetAptsByInseeCodeWeekRoute,
  GetHousesByInseeCodeWeekRoute,
  GetAptsBySectionYearRoute,
  GetHousesBySectionYearRoute,
  GetHousesBySectionMonthRoute,
  GetAptsBySectionMonthRoute,
} from "./mv.routes";
import * as HttpStatusCodes from "@/config/http-status-codes";
import {
  getAptsByInseeMonth,
  getAptsByInseeWeek,
  getAptsByInseeYear,
  getHousesByInseeMonth,
  getHousesByInseeWeek,
  getHousesByInseeYear,
  getAptsBySectionYear as getAptsBySectionYearRepository,
  getHousesBySectionYear as getHousesBySectionYearRepository,
  getAptsBySectionMonth as getAptsBySectionMonthRepository,
  getHousesBySectionMonth as getHousesBySectionMonthRepository,
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

// Section aggregates

export const getAptsBySectionYear: AppRouteHandler<
  GetAptsBySectionYearRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsBySectionYearRepository(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesBySectionYear: AppRouteHandler<
  GetHousesBySectionYearRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesBySectionYearRepository(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getAptsBySectionMonth: AppRouteHandler<
  GetAptsBySectionMonthRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getAptsBySectionMonthRepository(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesBySectionMonth: AppRouteHandler<
  GetHousesBySectionMonthRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getHousesBySectionMonthRepository(query);
  return c.json(results, HttpStatusCodes.OK);
};
