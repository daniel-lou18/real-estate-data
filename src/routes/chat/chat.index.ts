import { createRouter } from "@/lib/create-app";
import * as routes from "./chat.routes";
import * as handlers from "./chat.handlers";

const router = createRouter().openapi(routes.chat, handlers.chat);

export default router;
