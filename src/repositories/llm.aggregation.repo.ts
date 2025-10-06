import { db } from "@/db";
import { propertySales } from "@/db/schema/property_sales";
import type { AggregationArgs } from "@/services/llm/schemas";
import { buildAggregationArgs } from "@/services/llm/queryBuilder";

export async function runAggregationPlan(args: AggregationArgs) {
  const { select, where, groupBy, orderBy, limit, offset } =
    buildAggregationArgs(args);

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
