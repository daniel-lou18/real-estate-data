import { createRoute } from "@hono/zod-openapi";
import { MapFeatureCollectionSchema, MapFeatureParamsSchema, LegendSchema, } from "@app/shared";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
const tags = ["Map"];
export const getFeatureCollection = createRoute({
    tags,
    method: "get",
    path: "/features.geojson",
    request: {
        query: MapFeatureParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(MapFeatureCollectionSchema, "Map feature collection representing either communes or sections"),
    },
});
export const getLegend = createRoute({
    tags,
    method: "get",
    path: "/legend",
    request: {
        query: MapFeatureParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(LegendSchema, "Map legend with buckets and quantiles for a given field"),
    },
});
