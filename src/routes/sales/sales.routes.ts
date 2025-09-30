import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/config/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import { SelectPropertySaleSchema } from "@/db/schema";
import IdParamsSchema from "@/openapi/schemas/id-params";
import createErrorSchema from "@/openapi/schemas/create-error-schema";

const tags = ["Sales"];

export const list = createRoute({
  tags,
  method: "get",
  path: "/sales",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(SelectPropertySaleSchema),
      "List of property sales"
    ),
  },
});

export const getOne = createRoute({
  tags,
  method: "get",
  path: "/sales/{id}",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      SelectPropertySaleSchema,
      "The requested property sale"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z
        .object({
          message: z.string(),
        })
        .openapi({
          example: {
            message: "Not found",
          },
        }),
      "Property sale not found"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID"
    ),
  },
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
