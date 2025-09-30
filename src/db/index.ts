import env from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(env.DB_URL, {
  logger: true,
});

export type Db = typeof db;

export default db;
