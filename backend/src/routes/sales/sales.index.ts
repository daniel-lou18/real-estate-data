import * as routes from "./sales.routes";
import * as handlers from "./sales.handlers";
import analyticsRouter from "./analytics/analytics.index";
import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .route("/analytics", analyticsRouter);

export default router;
