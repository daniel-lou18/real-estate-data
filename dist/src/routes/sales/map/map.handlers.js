import { getMapFeatures } from "@/repositories/map/map.features";
import { getLegend as getLegendRepository } from "@/repositories/map/map.legend";
import * as HttpStatusCodes from "@/config/http-status-codes";
export const getFeatureCollection = async (c) => {
    const query = c.req.valid("query");
    const results = await getMapFeatures(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const getLegend = async (c) => {
    const query = c.req.valid("query");
    const results = await getLegendRepository(query);
    return c.json(results, HttpStatusCodes.OK);
};
