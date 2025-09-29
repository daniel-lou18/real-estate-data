import { createRouter } from "@/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";

const route = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Property Sales API Index",
    },
  },
});

const router = createRouter().openapi(route, (c) => {
  return c.json({ message: "Property Sales API" });
});

export default router;
