import { serve } from "@hono/node-server";
import app from "./app.js";
import env from "./config/env.js";

const PORT = env.PORT;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  () => console.log(`Server is running on http://localhost:${PORT}`)
);
