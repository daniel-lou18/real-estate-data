import { z } from "zod";
import type { ZodError } from "zod/v4";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]),
});

type Env = z.infer<typeof EnvSchema>;

let env: Env;

try {
  env = EnvSchema.parse(process.env);
} catch (err) {
  const error = err as ZodError;
  console.error("❌ Invalid environment variables");
  console.error(JSON.stringify(z.treeifyError(error), null, 2));
  process.exit(1);
}

export default env;
