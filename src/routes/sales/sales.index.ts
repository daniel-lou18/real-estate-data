import * as routes from "./sales.routes";
import * as handlers from "./sales.handlers";
import { createRouter } from "@/lib/create-app";

const router = createRouter().openapi(routes.list, handlers.list);

export default router;
