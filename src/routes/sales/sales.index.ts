import * as routes from "./sales.routes";
import * as handlers from "./sales.handlers";
import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne);

export default router;
