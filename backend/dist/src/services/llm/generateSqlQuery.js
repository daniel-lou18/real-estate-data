import { generateObjectService } from "./generateObjectService";
import { createSQLSystemPrompt } from "./systemPrompts";
import { SQLSchema } from "./schemas";
import { db } from "@/db";
import { sql } from "drizzle-orm";
export async function generateRawSqlQuery(messages) {
    return generateObjectService(messages, createSQLSystemPrompt(), SQLSchema);
}
export function validateSqlQuery({ query }) {
    if (!query.trim().toLowerCase().includes("select") ||
        query.trim().toLowerCase().includes("drop") ||
        query.trim().toLowerCase().includes("delete") ||
        query.trim().toLowerCase().includes("update") ||
        query.trim().toLowerCase().includes("insert") ||
        query.trim().toLowerCase().includes("alter") ||
        query.trim().toLowerCase().includes("create") ||
        query.trim().toLowerCase().includes("truncate") ||
        query.trim().toLowerCase().includes("rename") ||
        query.trim().toLowerCase().includes("grant") ||
        query.trim().toLowerCase().includes("revoke")) {
        throw new Error("Only SELECT queries are allowed");
    }
    const limitedQuery = limitQuery(query);
    return limitedQuery;
}
function limitQuery(query, maxLimit = 200) {
    const cleanQuery = query.trim().replace(/;+$/, "");
    const limitMatch = cleanQuery.match(/limit\s+(\d+)/i);
    if (limitMatch) {
        const existingLimit = parseInt(limitMatch[1]);
        if (existingLimit > maxLimit) {
            return cleanQuery.replace(/limit\s+\d+/i, `LIMIT ${maxLimit}`);
        }
        return cleanQuery;
    }
    return cleanQuery + ` LIMIT ${maxLimit}`;
}
export async function executeSqlQuery(query) {
    try {
        const result = await db.execute(sql.raw(query));
        return result;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to execute query");
    }
}
export async function generateSqlQuery(messages) {
    try {
        const rawQuery = await generateRawSqlQuery(messages);
        const validatedQuery = validateSqlQuery(rawQuery);
        const result = await executeSqlQuery(validatedQuery);
        return result.rows;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to generate SQL query");
    }
}
/**
 * Extract field information from Drizzle query result metadata
 * Much more reliable than parsing SQL strings
 */
function extractFieldInfoFromResult(queryResult) {
    const parseErrors = [];
    try {
        if (!queryResult.fields || !Array.isArray(queryResult.fields)) {
            parseErrors.push("No fields metadata available in query result");
            return { fields: [], hasAliases: false, parseErrors };
        }
        const fields = queryResult.fields.map((field) => {
            // Get the original column name from the field metadata
            const original = field.name || field.column || field.fieldName || "unknown";
            // Get the alias (if any) - this might be in different properties depending on the driver
            const alias = field.alias || field.column || field.name || original;
            // Determine if the field is numeric based on data type
            const isNumeric = isNumericDataType(field.dataType || field.type || "");
            return {
                original,
                alias,
                isNumeric,
            };
        });
        return {
            fields,
            hasAliases: fields.some((f) => f.original !== f.alias),
            parseErrors,
        };
    }
    catch (error) {
        parseErrors.push(`Error extracting field info from result: ${error}`);
        return { fields: [], hasAliases: false, parseErrors };
    }
}
/**
 * Determine if a data type is numeric based on PostgreSQL/MySQL data types
 */
function isNumericDataType(dataType) {
    const numericTypes = [
        "integer",
        "int",
        "int4",
        "int8",
        "bigint",
        "smallint",
        "numeric",
        "decimal",
        "real",
        "double precision",
        "float",
        "float4",
        "float8",
        "money",
        "serial",
        "bigserial",
    ];
    const lowerType = dataType.toLowerCase();
    return numericTypes.some((type) => lowerType.includes(type));
}
// Note: The complex SQL parsing functions have been removed in favor of
// using Drizzle's result metadata, which is much more reliable and simpler.
/**
 * Example usage demonstrating the new approach:
 *
 * const result = await generateSqlQueryWithPercentiles(
 *   messages,
 *   'price_per_m2', // Use the alias name from the result
 *   [10, 25, 50, 75, 90]
 * );
 *
 * The function will:
 * 1. Execute the query to get result metadata
 * 2. Extract field information from Drizzle's fields array
 * 3. Use the original column names for percentile calculations
 * 4. Return both the data and percentiles
 */
/**
 * Fallback: detect numeric fields from actual result data
 */
function detectNumericFieldsFromResult(rows) {
    if (rows.length === 0)
        return [];
    const numericFields = [];
    const firstRow = rows[0];
    for (const [key, value] of Object.entries(firstRow)) {
        if (typeof value === "number" && !isNaN(value)) {
            numericFields.push(key);
        }
    }
    return numericFields;
}
/**
 * Generate SQL query with percentiles, handling aliases properly
 */
export async function generateSqlQueryWithPercentiles(messages, targetFieldName, percentiles = [10, 25, 50, 75, 90]) {
    try {
        // Generate the base query
        const rawQuery = await generateRawSqlQuery(messages);
        const validatedQuery = validateSqlQuery(rawQuery);
        // Execute the original query first to get result metadata
        const result = await executeSqlQuery(validatedQuery);
        // Extract field information from result metadata
        const fieldInfo = extractFieldInfoFromResult(result);
        // Log any parsing errors for debugging
        if (fieldInfo.parseErrors.length > 0) {
            console.warn("Field extraction warnings:", fieldInfo.parseErrors);
        }
        // Find the target field
        const targetField = fieldInfo.fields.find((f) => f.alias === targetFieldName || f.original === targetFieldName);
        if (!targetField) {
            const availableFields = fieldInfo.fields.map((f) => f.alias).join(", ");
            const errorMsg = `Field '${targetFieldName}' not found in query. Available fields: ${availableFields}`;
            if (fieldInfo.parseErrors.length > 0) {
                throw new Error(`${errorMsg}\nField extraction errors: ${fieldInfo.parseErrors.join(", ")}`);
            }
            throw new Error(errorMsg);
        }
        // Create percentile calculation query
        // Use the original expression, not the alias, for the percentile calculation
        const percentileQuery = `
      WITH base_data AS (${validatedQuery})
      SELECT ${percentiles
            .map((p) => `round(percentile_cont(${p / 100}) within group (order by ${targetField.original})) as p${p}`)
            .join(", ")}
      FROM base_data
      WHERE ${targetField.original} IS NOT NULL
    `;
        const percentileResult = await executeSqlQuery(percentileQuery);
        const percentileData = percentiles.map((p) => ({
            percentile: p,
            value: percentileResult.rows[0][`p${p}`],
        }));
        return {
            data: result.rows,
            percentiles: percentileData,
            fieldInfo: {
                targetField: targetField.alias,
                isAliased: targetField.original !== targetField.alias,
                originalExpression: targetField.original,
            },
        };
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to generate SQL query with percentiles");
    }
}
/**
 * Auto-detect numeric fields and calculate percentiles for all of them
 */
export async function generateSqlQueryWithAutoPercentiles(messages, percentiles = [10, 25, 50, 75, 90]) {
    try {
        const rawQuery = await generateRawSqlQuery(messages);
        const validatedQuery = validateSqlQuery(rawQuery);
        // Execute the original query first to get result metadata
        const result = await executeSqlQuery(validatedQuery);
        // Extract field information from result metadata
        const fieldInfo = extractFieldInfoFromResult(result);
        // Log any parsing errors for debugging
        if (fieldInfo.parseErrors.length > 0) {
            console.warn("Field extraction warnings:", fieldInfo.parseErrors);
        }
        // Get numeric fields from metadata
        let numericFields = fieldInfo.fields.filter((f) => f.isNumeric);
        // Fallback: if no numeric fields detected from metadata, try result data analysis
        if (numericFields.length === 0) {
            console.warn("No numeric fields detected from metadata. Attempting fallback detection...");
            const fallbackFields = detectNumericFieldsFromResult(result.rows);
            if (fallbackFields.length === 0) {
                throw new Error("No numeric fields found for percentile calculation");
            }
            // Use fallback fields
            numericFields = fallbackFields.map((field) => ({
                original: field,
                alias: field,
                isNumeric: true,
            }));
        }
        // Calculate percentiles for all numeric fields
        const percentilePromises = numericFields.map(async (field) => {
            try {
                const percentileQuery = `
          WITH base_data AS (${validatedQuery})
          SELECT ${percentiles
                    .map((p) => `round(percentile_cont(${p / 100}) within group (order by ${field.original})) as p${p}`)
                    .join(", ")}
          FROM base_data
          WHERE ${field.original} IS NOT NULL
        `;
                const percentileResult = await executeSqlQuery(percentileQuery);
                return {
                    field: field.alias,
                    percentiles: percentiles.map((p) => ({
                        percentile: p,
                        value: percentileResult.rows[0][`p${p}`],
                    })),
                };
            }
            catch (error) {
                console.warn(`Failed to calculate percentiles for field ${field.alias}:`, error);
                return {
                    field: field.alias,
                    percentiles: percentiles.map((p) => ({
                        percentile: p,
                        value: null,
                    })),
                };
            }
        });
        const percentileResults = await Promise.all(percentilePromises);
        const percentilesMap = percentileResults.reduce((acc, curr) => {
            acc[curr.field] = curr.percentiles;
            return acc;
        }, {});
        return {
            data: result.rows,
            percentiles: percentilesMap,
            fieldInfo: fieldInfo.fields.map((f) => ({
                field: f.alias,
                isNumeric: f.isNumeric,
                isAliased: f.original !== f.alias,
            })),
        };
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to generate SQL query with auto percentiles");
    }
}
