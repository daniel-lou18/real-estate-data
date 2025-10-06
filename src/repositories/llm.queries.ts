import type { AggregationArgs, QueryArgs } from "@/services/llm/schemas";
import { buildQueryArgs } from "@/services/llm/queryBuilder";
import { buildAggregationArgs } from "@/services/llm/queryBuilder";
import type { ComputationArgs } from "@/services/llm/schemas";
import { buildComputationArgs } from "@/services/llm/queryBuilder";
import { executeQuery } from "./llm.executor";

export async function runQueryPlan(args: QueryArgs) {
  const builtArgs = buildQueryArgs(args);
  return executeQuery(builtArgs);
}

export async function runAggregationPlan(args: AggregationArgs) {
  const builtArgs = buildAggregationArgs(args);
  return executeQuery(builtArgs);
}

export async function runComputationPlan(args: ComputationArgs) {
  const builtArgs = buildComputationArgs(args);
  return executeQuery(builtArgs);
}
