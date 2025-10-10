import { cors } from "hono/cors";
import env from "@/config/env";

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  allowHeaders: ["Content-Type", "Authorization", "X-API-KEY"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
