import { db } from "@/db";
import { propertySales } from "@/db/schema/property_sales";
import type { z } from "zod";
import type { QuerySchema } from "@/services/llm/schemas";
import { buildQueryArgs } from "@/services/llm/queryBuilder";

export async function runQueryPlan(args: z.infer<typeof QuerySchema>) {
  const { select, where, orderBy, limit, offset } = buildQueryArgs(args);

  const rows = await db
    .select(select)
    .from(propertySales)
    .where(where)
    .orderBy(...(orderBy ?? []))
    .limit(limit)
    .offset(offset);

  return { rows, count: rows.length };
}
