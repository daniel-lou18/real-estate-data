import fs from "fs";
import path from "path";
const filePath = path.join(process.cwd(), "docs/PROPERTY_SALES.md");
const salesTableInfo = fs.readFileSync(filePath, "utf8");
export const intentSystemPrompt = `
You are a helpful data assistant. Your immediate task is ONLY to classify the user's intent, NOT to run any data operation.

Classify the request into one of these categories: "query", "aggregate", "compute", "schema", "explain", "compare", "unknown".

Guidance:
- If the user asks to list, filter, or retrieve rows/columns, choose "query". This includes simple queries like "give me all the properties sold in March 2024?" or "show me the apartments in Paris 75117 in section AB with a price between 100 000 and 200 000?".
- If the user asks to group, count, average, sum, or min/max over groups/time, choose "aggregate". This includes simple aggregates like "how many properties were sold in 2024?" or "what is the average price of properties sold in 2024?".
- If the user asks for derived metrics (e.g., price per square meter) or complex aggregation queries (e.g. top 10% by price) which are not raw queries of simple aggregates, choose "compute". This includes queries like "can you give me the average price per square meter of properties sold in 2024 per insee code?" or "what is the top 10% of properties sold by price?".
- If the user asks about the table or fields, choose "schema".
- If the user asks for interpretation or trend explanations, choose "explain".
- If the user asks to compare two sets or time periods conceptually, choose "compare".
- If unclear or out-of-scope, choose "unknown".

Output format (must strictly follow):
{
  "category": "query | aggregate | compute | schema | explain | compare | unknown",
  "confidence": 0..1,
  "explanation": "brief rationale"
}

Table context (read-only; do not restate it in the output):

${salesTableInfo}
`;
const operationConfigs = {
    query: {
        description: "Convert the user's natural language into a SINGLE query tool call.",
        sqlContext: "This query will be used in a SELECT postgresql query with or without WHERE, ORDER BY, and LIMIT clauses.",
        conversionRules: [
            {
                property: "select",
                description: "If the user specifies 1 or more columns to select, include them in the select property. If not specified, omit it. Omit columns that don't exist or aren't allowed.",
            },
            {
                property: "filters",
                description: "If the user specifies 1 or more filters, include them in the filters property. If not specified, omit it. Omit filters on columns that don't exist or aren't allowed.",
            },
            {
                property: "sort",
                description: "If the user specifies 1 or more sort fields, include them in the sort property. If not specified, omit it.",
            },
            {
                property: "limit",
                description: "If the user specifies a limit, include it in the limit property. If not specified, omit it.",
            },
            {
                property: "offset",
                description: "If the user specifies an offset, include it in the offset property. If not specified, omit it.",
            },
        ],
    },
    aggregation: {
        description: "Convert the user's natural language into a SINGLE aggregation tool call.",
        sqlContext: "This aggregation will be used in a GROUP BY postgresql query with or without WHERE, ORDER BY, and LIMIT clauses.",
        conversionRules: [
            {
                property: "groupBy",
                description: "If the user specifies 1 or more group by fields, include them in the groupBy property. If not specified, omit it. Omit fields that don't exist or aren't allowed.",
            },
            {
                property: "filters",
                description: "If the user specifies 1 or more filters, include them in the filters property. If not specified, omit it. Omit filters on columns that don't exist or aren't allowed.",
            },
            {
                property: "metrics",
                description: "If the user specifies 1 or more metrics (avg, sum, count, min, max), include them in the metrics property. If not specified, omit it. Omit metrics that don't exist or aren't allowed.",
            },
            {
                property: "sort",
                description: "If the user specifies 1 or more sort fields, include them in the sort property. If not specified, omit it.",
            },
            {
                property: "limit",
                description: "If the user specifies a limit, include it in the limit property. If not specified, omit it.",
            },
            {
                property: "offset",
                description: "If the user specifies an offset, include it in the offset property. If not specified, omit it.",
            },
        ],
    },
    computation: {
        description: "Convert the user's natural language into a SINGLE computation tool call.",
        sqlContext: "This computation will be used to calculate derived metrics (e.g., avgPricePerM2) or percentiles in a postgresql query with or without GROUP BY, WHERE, ORDER BY, and LIMIT clauses.",
        conversionRules: [
            {
                property: "computations",
                description: "If the user asks for derived metrics (avgPricePerM2) or percentiles, include them in the computations property. Each computation must specify its name and required parameters (e.g., percentile requires 'field' and 'percentile' value).",
            },
            {
                property: "groupBy",
                description: "If the user specifies 1 or more group by fields, include them in the groupBy property. If not specified, omit it. Omit fields that don't exist or aren't allowed.",
            },
            {
                property: "filters",
                description: "If the user specifies 1 or more filters, include them in the filters property. If not specified, omit it. Omit filters on columns that don't exist or aren't allowed.",
            },
            {
                property: "sort",
                description: "If the user specifies 1 or more sort fields, include them in the sort property. If not specified, omit it.",
            },
            {
                property: "limit",
                description: "If the user specifies a limit, include it in the limit property. If not specified, omit it.",
            },
        ],
    },
};
function createOperationSystemPrompt(operation) {
    const schemaName = operation[0].toUpperCase() + operation.slice(1) + "Schema";
    return `
  Rules:
  - Use ONLY fields that actually exist in the table. Do not invent columns or aliases.
  - Follow the exact input shape required by the ${schemaName}.
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

  Output: call the ${operation} tool with valid arguments only. Do not call any other tool.

  Table reference (for your reasoning only; do not echo it back):
  ${salesTableInfo}
  `;
}
function createSystemPrompt(operation) {
    const config = operationConfigs[operation];
    const operationSystemPrompt = createOperationSystemPrompt(operation);
    const conversionMethodology = config.conversionRules
        .map((rule) => `  - ${rule.description}`)
        .join("\n");
    return `
  You are a helpful data assistant. ${config.description} ${config.sqlContext}

  Conversion methodology:
${conversionMethodology}

  ${operationSystemPrompt}
  `;
}
export function createSQLSystemPrompt() {
    return `
You are a SQL (postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:

${salesTableInfo}

Only retrieval queries are allowed.

Output examples:

1. Simple query:
{
  "query": "SELECT date, primaryInseeCode, primarySection, price, nbApartments FROM property_sales WHERE price > 100000 AND propertyTypeLabel ILIKE '%APPARTEMENT%'"
}

2. Query with aggregation:
{
  "query": "SELECT primaryInseeCode, AVG(price), SUM(nbApartments) FROM property_sales WHERE price > 100000 AND propertyTypeLabel ILIKE '%APPARTEMENT%' GROUP BY primaryInseeCode"
}

3. Query with computation:
{
  "query": "SELECT primaryInseeCode, primarySection, SUM(price) / SUM(ApartmentFloorArea) AS avgPricePerM2 FROM property_sales WHERE propertyTypeLabel ILIKE '%APPARTEMENT%' GROUP BY primaryInseeCode, primarySection"
}
`;
}
export const querySystemPrompt = createSystemPrompt("query");
export const aggregationSystemPrompt = createSystemPrompt("aggregation");
export const computationSystemPrompt = createSystemPrompt("computation");
