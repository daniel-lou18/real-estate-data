import { buildQueryArgs } from "@/services/llm/queryBuilder";
import { buildAggregationArgs } from "@/services/llm/queryBuilder";
import { buildComputationArgs } from "@/services/llm/queryBuilder";
import { executeQuery } from "./llm.executor";
export async function runQueryPlan(args) {
    const builtArgs = buildQueryArgs(args);
    return executeQuery(builtArgs);
}
export async function runAggregationPlan(args) {
    const builtArgs = buildAggregationArgs(args);
    return executeQuery(builtArgs);
}
export async function runComputationPlan(args) {
    const builtArgs = buildComputationArgs(args);
    return executeQuery(builtArgs);
}
