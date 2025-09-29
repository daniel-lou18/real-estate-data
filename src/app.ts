import { OpenAPIHono } from "@hono/zod-openapi";
import notFound from "./middlewares/not-found";
import onError from "./middlewares/on-error";
import type { PinoLogger } from "hono-pino";
import { pinoLoggerMiddleware as pinoLogger } from "./middlewares/pino-logger";

type AppBindings = {
  Variables: {
    logger: PinoLogger;
  };
};

const app = new OpenAPIHono<AppBindings>();

app.use(pinoLogger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/error", (c) => {
  c.status(423);
  c.var.logger.info("Test Error Info");
  throw new Error("Test Error");
});

app.notFound(notFound);
app.onError(onError);

export default app;
