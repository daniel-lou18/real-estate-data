import path from "path";
// Set environment variables BEFORE any modules are loaded
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "trace";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "local";
process.env.DB_NAME = "real_estate_sales";
process.env.DB_PORT = "5433";
process.env.DB_URL =
    "postgresql://postgres:local@localhost:5433/real_estate_sales";
process.env.OPENAI_API_KEY = "test";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test";
export default {
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
};
