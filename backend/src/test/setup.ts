// Set test environment variables before any modules are loaded
// This ensures env.ts validation passes when imported
process.env.LOG_LEVEL = "info";
process.env.DB_PASSWORD = "test_password";
process.env.DB_NAME = "test_db";
process.env.DB_URL =
  "postgresql://test_user:test_password@localhost:5432/test_db";
process.env.OPENAI_API_KEY = "test_openai_key";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test_google_key";
