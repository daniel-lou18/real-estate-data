import { createRouter } from "@/lib/create-app";
import * as routes from "./map.routes";
import * as handlers from "./map.handlers";

const router = createRouter()
  .openapi(routes.getFeatureCollection, handlers.getFeatureCollection)
  .openapi(routes.getLegend, handlers.getLegend);

export default router;
