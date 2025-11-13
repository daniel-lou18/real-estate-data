import type { AppRouteHandler } from "@/types";
import type {
  GroupedByInseeCodeRoute,
  GroupedByMonthRoute,
  GroupedByPropertyTypeRoute,
  GroupedByInseeCodeAndSectionRoute,
  GroupedByYearRoute,
  SummaryRoute,
  PricePerM2DecilesRoute,
} from "./analytics.routes";
import {
  getSalesByInseeCode,
  getSalesByMonth,
  getSalesByPropertyType,
  getSalesByInseeCodeAndSection,
  getSalesByYear,
  getSalesSummary,
  getPricePerM2Deciles,
} from "../../../repositories/analytics.queries";
import * as HttpStatusCodes from "@/config/http-status-codes";

export const groupedByInseeCode: AppRouteHandler<
  GroupedByInseeCodeRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getSalesByInseeCode(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const groupedByInseeCodeAndSection: AppRouteHandler<
  GroupedByInseeCodeAndSectionRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getSalesByInseeCodeAndSection(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const groupedByPropertyType: AppRouteHandler<
  GroupedByPropertyTypeRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getSalesByPropertyType(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const groupedByYear: AppRouteHandler<GroupedByYearRoute> = async (c) => {
  const query = c.req.valid("query");
  const results = await getSalesByYear(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const groupedByMonth: AppRouteHandler<GroupedByMonthRoute> = async (
  c
) => {
  const query = c.req.valid("query");
  const results = await getSalesByMonth(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const summary: AppRouteHandler<SummaryRoute> = async (c) => {
  const query = c.req.valid("query");
  const results = await getSalesSummary(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const pricePerM2Deciles: AppRouteHandler<
  PricePerM2DecilesRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getPricePerM2Deciles(query);
  return c.json(results, HttpStatusCodes.OK);
};
