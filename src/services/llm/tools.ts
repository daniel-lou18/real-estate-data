import { tool } from "ai";
import { AggregationSchema, IntentSchema, QuerySchema } from "./schemas";

export const classifyIntent = tool({
  description:
    "Classify the intent of the user in order to determine the appropriate data operation",
  inputSchema: IntentSchema,
  execute: (args) => {
    console.log("classifyIntent", args);
    return { ...args };
  },
});

export const executeQuery = tool({
  description: "Plan the query to be executed on the data",
  inputSchema: QuerySchema,
  execute: (args) => {
    console.log("planQuery", args);
    return { ...args };
  },
});

export const executeAggregation = tool({
  description: "Plan the aggregation to be executed on the data",
  inputSchema: AggregationSchema,
  execute: (args) => {
    console.log("planAggregation", args);
    return { ...args };
  },
});

export const tools = {
  classifyIntent,
  executeQuery,
  executeAggregation,
} as const;

export type Tools = typeof tools;
export type ToolName = keyof typeof tools;
export type Tool = (typeof tools)[ToolName];

// Represents an object containing exactly one of the available tools
export type SingleToolObject =
  | { classifyIntent: typeof classifyIntent }
  | { executeQuery: typeof executeQuery }
  | { executeAggregation: typeof executeAggregation };
