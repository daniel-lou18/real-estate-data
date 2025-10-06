import { tool } from "ai";
import { AggregationSchema, IntentSchema, QuerySchema } from "./schemas";
import { runQueryPlan } from "@/repositories/llm.query.repo";
import { runAggregationPlan } from "@/repositories/llm.aggregation.repo";

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
  description: "Execute a validated query plan against property sales",
  inputSchema: QuerySchema,
  execute: async (args) => {
    console.log(`Executing query with args: ${JSON.stringify(args, null, 2)}`);
    return await runQueryPlan(args);
  },
});

export const executeAggregation = tool({
  description: "Execute a validated aggregation plan against property sales",
  inputSchema: AggregationSchema,
  execute: async (args) => {
    console.log(
      `Executing aggregation with args: ${JSON.stringify(args, null, 2)}`
    );
    return await runAggregationPlan(args);
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
