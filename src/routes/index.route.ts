import * as HttpStatusCodes from "@/config/http-status-codes";
import { createRouter } from "@/lib/create-app";
import jsonContent from "@/openapi/helpers/json-content";
import { createRoute } from "@hono/zod-openapi";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";

const indexRoute = createRoute({
  tags: ["Index"],
  method: "get",
  path: "/",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("Property Sales API"),
      "Property Sales API Index"
    ),
  },
});

const router = createRouter().openapi(indexRoute, (c) => {
  return c.json({ message: "Property Sales API" }, HttpStatusCodes.OK);
});

export default router;
