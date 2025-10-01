import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import {
  AnalyticsQueryParamsSchema,
  SalesByInseeCodeSchema,
} from "./analytics.schemas";

const tags = ["Sales", "Analytics"];

export const groupedByInseeCode = createRoute({
  tags,
  method: "get",
  path: "/by-insee-code",
  request: {
    query: AnalyticsQueryParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(SalesByInseeCodeSchema),
      "List of analytics aggregated by insee code"
    ),
  },
});

export type GroupedByInseeCodeRoute = typeof groupedByInseeCode;
