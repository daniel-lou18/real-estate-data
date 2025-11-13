import { db } from "@/db";
import { propertySales } from "@/db/schema/property_sales";
export async function executeQuery(args) {
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
