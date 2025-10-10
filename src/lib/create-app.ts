import { OpenAPIHono } from "@hono/zod-openapi";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { pinoLoggerMiddleware as pinoLogger } from "@/middlewares/pino-logger";
import serveEmojiFavicon from "@/middlewares/serve-favicon";
import type { AppBindings, AppOpenAPI } from "@/types";
import defaultHook from "@/openapi/default-hook";
import { corsMiddleware } from "@/middlewares/cors";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app.use(corsMiddleware);
  app.use(serveEmojiFavicon("📊"));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

export function createTestApp(router: AppOpenAPI) {
  const testApp = createApp();
  testApp.route("/", router);

  return testApp;
}
