import env from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(env.DB_URL, {
  schema,
  logger: true,
});

export type Db = typeof db;

export default db;
