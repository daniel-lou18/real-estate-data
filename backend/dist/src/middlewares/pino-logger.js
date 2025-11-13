import { pinoLogger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";
import crypto from "crypto";
import env from "@/config/env.js";
export function pinoLoggerMiddleware() {
    return pinoLogger({
        pino: pino({ level: env.LOG_LEVEL }, env.NODE_ENV === "production" ? undefined : pretty()),
        http: {
            reqId: () => crypto.randomUUID(),
        },
    });
}
