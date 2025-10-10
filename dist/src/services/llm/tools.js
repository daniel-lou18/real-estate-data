import { tool } from "ai";
import { AggregationSchema, ComputationSchema, IntentSchema, QuerySchema, } from "./schemas";
import { runQueryPlan } from "@/repositories/llm.queries";
import { runAggregationPlan } from "@/repositories/llm.queries";
import { runComputationPlan } from "@/repositories/llm.queries";
export const classifyIntent = tool({
    description: "Classify the intent of the user in order to determine the appropriate data operation",
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
        console.log(`Executing aggregation with args: ${JSON.stringify(args, null, 2)}`);
        return await runAggregationPlan(args);
    },
});
export const executeComputation = tool({
    description: "Execute a validated computation plan against property sales",
    inputSchema: ComputationSchema,
    execute: async (args) => {
        console.log(`Executing computation with args: ${JSON.stringify(args, null, 2)}`);
        return await runComputationPlan(args);
    },
});
export const tools = {
    classifyIntent,
    executeQuery,
    executeAggregation,
    executeComputation,
};
