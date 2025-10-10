import { z } from "zod";
const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]),
    DB_HOST: z.string().default("localhost"),
    DB_USER: z.string().default("postgres"),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_PORT: z.coerce.number().default(5432),
    DB_URL: z.url(),
    OPENAI_API_KEY: z.string(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
});
let env;
try {
    env = EnvSchema.parse(process.env);
}
catch (err) {
    const error = err;
    console.error("❌ Invalid environment variables");
    console.error(JSON.stringify(z.treeifyError(error), null, 2));
    process.exit(1);
}
export default env;
