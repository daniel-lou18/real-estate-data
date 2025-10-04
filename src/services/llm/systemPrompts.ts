import fs from "fs";
import path from "path";

const filePath = path.join(
  import.meta.dirname,
  "../../db/schema/PROPERTY_SALES.md"
);
const salesTableInfo = fs.readFileSync(filePath, "utf8");

export const intentSystemPrompt = `
You are a helpful data assistant. Your immediate task is ONLY to classify the user's intent, NOT to run any data operation.

Classify the request into one of these categories: "query", "aggregate", "calculate", "schema", "explain", "compare", "unknown".

Guidance:
- If the user asks to list, filter, or retrieve rows/columns, choose "query".
- If the user asks to group, count, average, sum, min/max, or compute metrics over groups/time, choose "aggregate".
- If the user asks for a derived figure (e.g., rate or per-capita) without specifying retrieval details, choose "calculate".
- If the user asks about the table or fields, choose "schema".
- If the user asks for interpretation or trend explanations, choose "explain".
- If the user asks to compare two sets or time periods conceptually, choose "compare".
- If unclear or out-of-scope, choose "unknown".

Output format (must strictly follow):
{
  "category": "query | aggregate | calculate | schema | explain | compare | unknown",
  "confidence": 0..1,
  "explanation": "brief rationale"
}

Table context (read-only; do not restate it in the output):

${salesTableInfo}
`;

function createOperationSystemPrompt(operation: "query" | "aggregation") {
  return `
  Rules:
  - Use ONLY fields that actually exist in the table. Do not invent columns or aliases.
  - Follow the exact input shape required by the ${
    operation === "query" ? "QuerySchema" : "AggregationSchema"
  }.
  - Keep outputs minimal and machine-readable. Do not include prose outside the tool call.
  - If a filter value is missing but clearly implied (e.g., a city code), infer conservatively; otherwise omit the filter.
  - If sort is not specified, omit it rather than guessing.
  - Use reasonable limits (e.g., 100–200) if the user did not specify a limit.

  Mapping guidance:
  - Dates and periods: prefer "year" or "month" when grouping or filtering by time.
  - Geography: use "primaryInseeCode" and/or "primarySection" where relevant.
  - Property type: use "propertyTypeCode" or "propertyTypeLabel".
  - Volumes: counts are represented by "nbProperties", and subtype counts by the corresponding columns.
  - Areas: use the appropriate floor area column names.

  Output: call the ${
    operation === "query" ? "executeQuery" : "executeAggregation"
  } tool with valid arguments only. Do not call any other tool.

  Table reference (for your reasoning only; do not echo it back):
  ${salesTableInfo}
  `;
}

function createQuerySystemPrompt() {
  const operationSystemPrompt = createOperationSystemPrompt("query");

  return `
  You are a helpful data assistant. Convert the user's natural language into a SINGLE query tool call. This query will be used in a SELECT postgresql query with or without WHERE, GROUP BY, ORDER BY, and LIMIT clauses.

  Conversion methodology:
  - If the user specifies 1 or more columns to select, include them in the select property of the tool payload. If the user does not specify any columns to select, omit the select property. If the user specifies a column that does not exist or is not allowed, omit the column.
  - If the user specifies 1 or more filters, include them in the filters property of the tool payload. If the user does not specify any filters, omit the filters property. If the user specifies a filter on a column that does not exist or is not allowed, omit the filter.
  - If the user specifies 1 or more sort fields, include them in the sort property of the tool payload. If the user does not specify any sort fields, omit the sort property.
  - If the user specifies a limit, include it in the limit property of the tool payload. If the user does not specify a limit, omit the limit property.
  - If the user specifies an offset, include it in the offset property of the tool payload. If the user does not specify an offset, omit the offset property.

  ${operationSystemPrompt}
  `;
}

function createAggregationSystemPrompt() {
  const operationSystemPrompt = createOperationSystemPrompt("aggregation");

  return `
  You are a helpful data assistant. Convert the user's natural language into a SINGLE aggregation tool call. This aggregation will be used in a GROUP BY postgresql query with or without WHERE, ORDER BY, and LIMIT clauses.

  Conversion methodology:
  - If the user specifies 1 or more group by fields, include them in the groupBy property of the tool payload. If the user does not specify any group by fields, omit the groupBy property. If the user specifies a group by field that does not exist or is not allowed, omit the group by field.
  - If the user specifies 1 or more filter fields, include them in the filters property of the tool payload. If the user does not specify any filter fields, omit the filters property. If the user specifies a filter field that does not exist or is not allowed, omit the filter field.
  - If the user specifies 1 or more metrics, include them in the metrics property of the tool payload. If the user does not specify any metrics, omit the metrics property. If the user specifies a metric that does not exist or is not allowed, omit the metric.
  - If the user specifies 1 or more sort fields, include them in the sort property of the tool payload. If the user does not specify any sort fields, omit the sort property.
  - If the user specifies a limit, include it in the limit property of the tool payload. If the user does not specify a limit, omit the limit property.
  - If the user specifies an offset, include it in the offset property of the tool payload. If the user does not specify an offset, omit the offset property.

  ${operationSystemPrompt}
  `;
}

export const querySystemPrompt = createQuerySystemPrompt();
export const aggregationSystemPrompt = createAggregationSystemPrompt();
