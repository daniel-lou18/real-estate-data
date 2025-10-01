import type { AppRouteHandler } from "@/types";
import type { GroupedByInseeCodeRoute } from "./analytics.routes";
import { getSalesByInseeCode } from "./analytics.queries";
import * as HttpStatusCodes from "@/config/http-status-codes";

export const groupedByInseeCode: AppRouteHandler<
  GroupedByInseeCodeRoute
> = async (c) => {
  const query = c.req.valid("query");

  const results = await getSalesByInseeCode(query);

  return c.json(results, HttpStatusCodes.OK);
};
