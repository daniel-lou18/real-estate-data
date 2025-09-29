import { OpenAPIHono } from "@hono/zod-openapi";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { pinoLoggerMiddleware as pinoLogger } from "@/middlewares/pino-logger";
import serveEmojiFavicon from "@/middlewares/serve-favicon";
import type { AppBindings } from "@/types";
import defaultHook from "@/openapi/default-hook";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app.use(serveEmojiFavicon("📊"));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
