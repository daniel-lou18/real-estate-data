import { COLUMN_MAP, compileComputations, compileFilters, compileGroupBy, compileMetrics, compileSelect, compileSort, DEFAULT_METRICS, DEFAULT_SELECT, normalizePagination, } from "./mappers";
export function buildQueryArgs(args) {
    const { limit, offset } = normalizePagination(args.limit, args.offset);
    const where = compileFilters(args.filters ?? []);
    const select = compileSelect(args.select ?? []) ?? DEFAULT_SELECT;
    const orderBy = compileSort(args.sort ?? []);
    return { select, where, orderBy, limit, offset };
}
export function buildAggregationArgs(args) {
    const { limit, offset } = normalizePagination(args.limit, 0);
    const where = compileFilters(args.filters ?? []);
    const groupBy = args.groupBy?.length
        ? compileGroupBy(args.groupBy)
        : undefined;
    const metricSelect = args.metrics?.length
        ? compileMetrics(args.metrics)
        : DEFAULT_METRICS;
    const groupSelect = {};
    for (const g of args.groupBy ?? []) {
        groupSelect[g] = COLUMN_MAP[g];
    }
    const select = { ...groupSelect, ...metricSelect };
    const orderBy = compileSort(args.sort ?? []);
    return { select, where, groupBy, orderBy, limit, offset };
}
export function buildComputationArgs(args) {
    const { limit, offset } = normalizePagination(args.limit, 0);
    const where = compileFilters(args.filters ?? []);
    const groupBy = args.groupBy?.length
        ? compileGroupBy(args.groupBy)
        : undefined;
    const computationSelect = compileComputations(args.computations);
    if (!computationSelect) {
        throw new Error("At least one computation is required");
    }
    const groupSelect = {};
    for (const g of args.groupBy ?? []) {
        groupSelect[g] = COLUMN_MAP[g];
    }
    const select = { ...groupSelect, ...computationSelect };
    const orderBy = compileSort(args.sort ?? []);
    return { select, where, groupBy, orderBy, limit, offset };
}
