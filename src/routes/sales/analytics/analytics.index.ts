import { createRouter } from "@/lib/create-app";
import * as routes from "./analytics.routes";
import * as handlers from "./analytics.handlers";

const router = createRouter().openapi(
  routes.groupedByInseeCode,
  handlers.groupedByInseeCode
);

export default router;
