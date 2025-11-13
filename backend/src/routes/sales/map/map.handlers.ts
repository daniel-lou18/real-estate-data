import type { AppRouteHandler } from "@/types";
import type { GetFeatureCollectionRoute, GetLegendRoute } from "./map.routes";
import { getMapFeatures } from "@/repositories/map/map.features";
import { getLegend as getLegendRepository } from "@/repositories/map/map.legend";
import * as HttpStatusCodes from "@/config/http-status-codes";

export const getFeatureCollection: AppRouteHandler<
  GetFeatureCollectionRoute
> = async (c) => {
  const query = c.req.valid("query");
  const results = await getMapFeatures(query);
  return c.json(results, HttpStatusCodes.OK);
};

export const getLegend: AppRouteHandler<GetLegendRoute> = async (c) => {
  const query = c.req.valid("query");
  const results = await getLegendRepository(query);
  return c.json(results, HttpStatusCodes.OK);
};
