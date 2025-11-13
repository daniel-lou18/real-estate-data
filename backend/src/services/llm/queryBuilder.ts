import type {
  AggregationArgs,
  AllowedColumns,
  ComputationArgs,
} from "./schemas";
import type { QueryArgs } from "./schemas";
import {
  COLUMN_MAP,
  compileComputations,
  compileFilters,
  compileGroupBy,
  compileMetrics,
  compileSelect,
  compileSort,
  DEFAULT_METRICS,
  DEFAULT_SELECT,
  normalizePagination,
} from "./mappers";

export type BuiltQueryArgs = {
  select: Record<string, any>;
  where?: any;
  orderBy?: any[];
  limit: number;
  offset: number;
};

export type BuiltAggregationArgs = {
  select: Record<string, any>;
  where?: any;
  groupBy?: any[];
  orderBy?: any[];
  limit: number;
  offset: number;
};

export type BuiltComputationArgs = {
  select: Record<string, any>;
  where?: any;
  groupBy?: any[];
  orderBy?: any[];
  limit: number;
  offset: number;
};

export function buildQueryArgs(args: QueryArgs): BuiltQueryArgs {
  const { limit, offset } = normalizePagination(args.limit, args.offset);
  const where = compileFilters(args.filters ?? []);
  const select = compileSelect(args.select ?? []) ?? DEFAULT_SELECT;
  const orderBy = compileSort(args.sort ?? []);

  return { select, where, orderBy, limit, offset };
}

export function buildAggregationArgs(
  args: AggregationArgs
): BuiltAggregationArgs {
  const { limit, offset } = normalizePagination(args.limit, 0);
  const where = compileFilters(args.filters ?? []);

  const groupBy = args.groupBy?.length
    ? compileGroupBy(args.groupBy)
    : undefined;
  const metricSelect = args.metrics?.length
    ? compileMetrics(args.metrics)
    : DEFAULT_METRICS;

  const groupSelect: Record<string, any> = {};
  for (const g of args.groupBy ?? []) {
    groupSelect[g] = COLUMN_MAP[g as AllowedColumns];
  }

  const select = { ...groupSelect, ...metricSelect } as const;
  const orderBy = compileSort(args.sort ?? []);

  return { select, where, groupBy, orderBy, limit, offset };
}

export function buildComputationArgs(
  args: ComputationArgs
): BuiltComputationArgs {
  const { limit, offset } = normalizePagination(args.limit, 0);
  const where = compileFilters(args.filters ?? []);

  const groupBy = args.groupBy?.length
    ? compileGroupBy(args.groupBy)
    : undefined;

  const computationSelect = compileComputations(args.computations);
  if (!computationSelect) {
    throw new Error("At least one computation is required");
  }

  const groupSelect: Record<string, any> = {};
  for (const g of args.groupBy ?? []) {
    groupSelect[g] = COLUMN_MAP[g as AllowedColumns];
  }

  const select = { ...groupSelect, ...computationSelect } as const;
  const orderBy = compileSort(args.sort ?? []);

  return { select, where, groupBy, orderBy, limit, offset };
}
