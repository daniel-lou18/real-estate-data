import { generateObjectService } from "@/services/llm/generateObjectService";
import {
  DIMENSION_FIELDS,
  FEATURE_YEARS,
  METRIC_FIELDS,
  MONTHS,
  PROPERTY_TYPES,
  NUMERIC_FILTER_OPERATIONS,
  UserIntentSchema,
} from "@app/shared";
import type { ModelMessage } from "ai";
import type { UserIntent } from "./types";

const userIntentSystemPrompt = createUserIntentSystemPrompt();

export async function generateIntent(
  messages: ModelMessage[]
): Promise<UserIntent> {
  const result = await generateObjectService(
    messages,
    userIntentSystemPrompt,
    UserIntentSchema
  );
  return result as UserIntent;
}

function createUserIntentSystemPrompt(): string {
  const formatList = (values: readonly (string | number)[]) =>
    values
      .map((value) => (typeof value === "string" ? `"${value}"` : `${value}`))
      .join(", ");

  const dimensionValues = formatList(DIMENSION_FIELDS);
  const metricValues = formatList(METRIC_FIELDS);
  const propertyTypeValues = formatList(PROPERTY_TYPES);
  const filterOperations = formatList(NUMERIC_FILTER_OPERATIONS);
  const minYear = FEATURE_YEARS[0];
  const maxYear = FEATURE_YEARS[FEATURE_YEARS.length - 1];
  const minMonth = MONTHS[0];
  const maxMonth = MONTHS[MONTHS.length - 1];

  return `
You translate natural language about French property sales into structured JSON.

Key principles:
- Dimension filtering (location, time): Use "inseeCodes", "sections", "year", "month", "primaryDimension", and "propertyType" fields directly.
- Numerical filtering (metrics): Use "filters" object with metric field names (e.g., "total_sales", "avg_price_m2", "avg_price").
- The schema enforces valid values, so focus on understanding user intent and mapping it correctly.

Rules:
- Omit optional fields when the user does not imply them.
- "primaryDimension": ${dimensionValues}. Set when grouping/aggregating by that dimension (e.g., "by commune", "by year").
- "metric": ${metricValues}. Set when the user specifies a metric to inspect or order by.
- "propertyType": ${propertyTypeValues}. Map plural phrases like "apartments" to "apartment".
- "inseeCodes": Array of 5-digit INSEE codes (strings like "75112"). Use when filtering by commune(s).
- "sections": Array of 10-character section identifiers (strings like "75112000BZ"). Use when filtering by cadastral section(s).
- "year": Integer from ${minYear} to ${maxYear}. Omit if invalid or unspecified.
- "month": Integer from ${minMonth} to ${maxMonth}. Omit if invalid or unspecified.
- "filters": Object with metric field names as keys. Each value has:
  * "operation": ${filterOperations}
  * "value": number or [number, number] for "between"
  * Valid metric keys: ${metricValues}
- For "between" operation, supply exactly two numbers sorted from low to high. Use identical bounds for equality.
- "minSales": Integer >= 0. Use when user asks for minimum number of transactions (convenience field that maps to filters.total_sales).
- "limit": Integer between 1 and 500. Set for explicit limits like "top 10".
- "sortOrder": "asc" | "desc". Set when user states direction (e.g., "ascending", "descending", "highest", "lowest"). Use "desc" for highest/top, "asc" for lowest/bottom.
- Do not invent geographic codes; omit location fields if uncertain.
- If the request lacks required detail to populate a field confidently, leave the field out.

Examples:
User: "Show me the top 10 communes by average price per square meter in 2024."
{"primaryDimension":"inseeCode","metric":"avg_price_m2","year":2024,"limit":10,"sortOrder":"desc"}

User: "Filter apartments sold in INSEE 75117 with at least 50 sales last year."
{"inseeCodes":["75117"],"propertyType":"apartment","year":${maxYear},"minSales":50}

User: "Show me sections 75112000BZ and 75107000AY with average price above 5000 per m²."
{"sections":["75112000BZ","75107000AY"],"filters":{"avg_price_m2":{"operation":"gte","value":5000}}}

User: "Compare Paris (75101) and Lyon (69123) by total sales in 2023."
{"inseeCodes":["75101","69123"],"primaryDimension":"inseeCode","metric":"total_sales","year":2023}
`.trim();
}
