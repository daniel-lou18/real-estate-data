import { db } from "@/db";
import { propertySales } from "@/db/schema/property_sales";
import type { SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export type ExecutorArgs = {
  select: Record<string, PgColumn | SQL>;
  where?: SQL;
  groupBy?: PgColumn[];
  orderBy?: SQL[];
  limit: number;
  offset: number;
};

export async function executeQuery(args: ExecutorArgs) {
  const { select, where, groupBy, orderBy, limit, offset } = args;

  const rows = await db
    .select(select)
    .from(propertySales)
    .where(where)
    .groupBy(...(groupBy ?? []))
    .orderBy(...(orderBy ?? []))
    .limit(limit)
    .offset(offset);

  return { rows, count: rows.length };
}
