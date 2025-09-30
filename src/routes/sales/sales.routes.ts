import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";

export const list = createRoute({
  tags: ["Sales"],
  method: "get",
  path: "/sales",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(
        z.object({
          year: z.number(),
          month: z.number(),
          date: z.string(),
          nbApartments: z.number(),
          nbHouses: z.number(),
          price: z.number(),
          floorArea: z.number(),
        })
      ),
      "List of property sales"
    ),
  },
});

export type ListRoute = typeof list;
