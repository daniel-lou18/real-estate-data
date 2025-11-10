import type { AppRouteHandler } from "@/types";
import type * as routes from "./mv_deltas.routes";
import * as repository from "@/repositories/mv/mv.deltas";
import * as HttpStatusCodes from "@/config/http-status-codes";

export const getAptsByInseeCodeYearlyDeltas: AppRouteHandler<
  routes.GetAptsByInseeCodeYearlyDeltasRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await repository.getAptsByInseeYearDeltas(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesByInseeCodeYearlyDeltas: AppRouteHandler<
  routes.GetHousesByInseeCodeYearlyDeltasRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await repository.getHousesByInseeYearDeltas(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getAptsBySectionYearlyDeltas: AppRouteHandler<
  routes.GetAptsBySectionYearlyDeltasRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await repository.getAptsBySectionYearDeltas(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getHousesBySectionYearlyDeltas: AppRouteHandler<
  routes.GetHousesBySectionYearlyDeltasRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await repository.getHousesBySectionYearDeltas(query);
  return c.json(results, HttpStatusCodes.OK);
};
