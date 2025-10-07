import { generateObjectService } from "./generateObjectService";
import { createSQLSystemPrompt } from "./systemPrompts";
import { SQLSchema, type SqlQuery } from "./schemas";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function generateRawSqlQuery(prompt: string): Promise<SqlQuery> {
  return generateObjectService(prompt, createSQLSystemPrompt(), SQLSchema);
}

export function validateSqlQuery({ query }: SqlQuery) {
  if (
    !query.trim().toLowerCase().startsWith("select") ||
    query.trim().toLowerCase().includes("drop") ||
    query.trim().toLowerCase().includes("delete") ||
    query.trim().toLowerCase().includes("update") ||
    query.trim().toLowerCase().includes("insert") ||
    query.trim().toLowerCase().includes("alter") ||
    query.trim().toLowerCase().includes("create") ||
    query.trim().toLowerCase().includes("truncate") ||
    query.trim().toLowerCase().includes("rename") ||
    query.trim().toLowerCase().includes("grant") ||
    query.trim().toLowerCase().includes("revoke")
  ) {
    throw new Error("Only SELECT queries are allowed");
  }

  return query;
}

export async function executeSqlQuery(query: string) {
  try {
    const result = await db.execute(sql.raw(query));
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to execute query");
  }
}

export async function generateSqlQuery(prompt: string) {
  try {
    const rawQuery = await generateRawSqlQuery(prompt);
    const validatedQuery = validateSqlQuery(rawQuery);
    const result = await executeSqlQuery(validatedQuery);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate SQL query");
  }
}
