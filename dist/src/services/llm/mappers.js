import { sql, and, asc, desc, SQL } from "drizzle-orm";
import { propertySales } from "@/db/schema/property_sales";
export const DEFAULT_SELECT = {
    id: propertySales.id,
    date: propertySales.date,
    primaryInseeCode: propertySales.primaryInseeCode,
    primarySection: propertySales.primarySection,
    price: propertySales.price,
    nbProperties: propertySales.nbProperties,
    nbHouses: propertySales.nbHouses,
    nbApartments: propertySales.nbApartments,
    floorArea: propertySales.floorArea,
    ApartmentFloorArea: propertySales.ApartmentFloorArea,
    HouseFloorArea: propertySales.HouseFloorArea,
    propertyTypeCode: propertySales.propertyTypeCode,
    propertyTypeLabel: propertySales.propertyTypeLabel,
};
export const DEFAULT_METRICS = {
    avg_price: sql `coalesce(avg(${propertySales.price}), 0)`,
    avg_floorArea: sql `coalesce(avg(${propertySales.floorArea}), 0)`,
    avg_ApartmentFloorArea: sql `coalesce(avg(${propertySales.ApartmentFloorArea}), 0)`,
    avg_HouseFloorArea: sql `coalesce(avg(${propertySales.HouseFloorArea}), 0)`,
    sum_nbProperties: sql `coalesce(sum(${propertySales.nbProperties}), 0)`,
    sum_nbHouses: sql `coalesce(sum(${propertySales.nbHouses}), 0)`,
    sum_nbApartments: sql `coalesce(sum(${propertySales.nbApartments}), 0)`,
};
export const COLUMN_MAP = {
    ...DEFAULT_SELECT,
    year: propertySales.year,
    month: propertySales.month,
    nbWorkspaces: propertySales.nbWorkspaces,
    nbSecondaryUnits: propertySales.nbSecondaryUnits,
    nbapt1pp: propertySales.nbapt1pp,
    nbapt2pp: propertySales.nbapt2pp,
    nbapt3pp: propertySales.nbapt3pp,
    nbapt4pp: propertySales.nbapt4pp,
    nbapt5pp: propertySales.nbapt5pp,
    nbmai1pp: propertySales.nbmai1pp,
    nbmai2pp: propertySales.nbmai2pp,
    nbmai3pp: propertySales.nbmai3pp,
    nbmai4pp: propertySales.nbmai4pp,
    nbmai5pp: propertySales.nbmai5pp,
    WorkspaceFloorArea: propertySales.WorkspaceFloorArea,
    sapt1pp: propertySales.sapt1pp,
    sapt2pp: propertySales.sapt2pp,
    sapt3pp: propertySales.sapt3pp,
    sapt4pp: propertySales.sapt4pp,
    sapt5pp: propertySales.sapt5pp,
    smai1pp: propertySales.smai1pp,
    smai2pp: propertySales.smai2pp,
    smai3pp: propertySales.smai3pp,
    smai4pp: propertySales.smai4pp,
    smai5pp: propertySales.smai5pp,
};
export function normalizePagination(limit, offset) {
    const safeLimit = limit && limit > 0 ? Math.min(limit, 500) : 50;
    const safeOffset = Math.max(offset ?? 0, 0);
    return { limit: safeLimit, offset: safeOffset };
}
export function compileFilters(filters) {
    if (!filters || filters.length === 0)
        return undefined;
    const parts = [];
    for (const f of filters) {
        const col = COLUMN_MAP[f.field];
        if (!col)
            throw new Error(`Unsupported filter field: ${f.field}`);
        switch (f.operator) {
            case "=":
                parts.push(sql `${col} = ${f.value}`);
                break;
            case "!=":
                parts.push(sql `${col} != ${f.value}`);
                break;
            case ">":
                parts.push(sql `${col} > ${f.value}`);
                break;
            case ">=":
                parts.push(sql `${col} >= ${f.value}`);
                break;
            case "<":
                parts.push(sql `${col} < ${f.value}`);
                break;
            case "<=":
                parts.push(sql `${col} <= ${f.value}`);
                break;
            case "between":
                if (!Array.isArray(f.value) || f.value.length !== 2) {
                    throw new Error("between requires [min, max]");
                }
                parts.push(sql `${col} between ${f.value[0]} and ${f.value[1]}`);
                break;
            case "in":
                if (!Array.isArray(f.value))
                    throw new Error("in requires an array value");
                parts.push(sql `${col} in ${sql.join(f.value.map((v) => sql `${v}`), sql `,`)}`);
                break;
            case "ilike":
                parts.push(sql `${col} ilike ${f.value}`);
                break;
            case "is_null":
                parts.push(sql `${col} is ${f.value ? sql `null` : sql `not null`}`);
                break;
            default:
                throw new Error(`Unsupported operator: ${f.operator}`);
        }
    }
    return parts.length
        ? parts.length === 1
            ? parts[0]
            : and(...parts)
        : undefined;
}
export function compileSort(sort) {
    if (!sort || sort.length === 0)
        return undefined;
    const clauses = sort.map((s) => {
        const col = COLUMN_MAP[s.field];
        if (!col)
            throw new Error(`Unsupported sort field: ${s.field}`);
        return s.dir === "asc" ? asc(col) : desc(col);
    });
    return clauses;
}
export function compileSelect(select) {
    if (!select || select.length === 0)
        return undefined;
    const result = {};
    for (const key of select) {
        const col = COLUMN_MAP[key];
        if (!col)
            throw new Error(`Unsupported select field: ${key}`);
        result[key] = col;
    }
    return result;
}
export function compileGroupBy(groupBy) {
    return groupBy.map((g) => {
        const col = COLUMN_MAP[g];
        if (!col)
            throw new Error(`Unsupported group by: ${g}`);
        return col;
    });
}
export function compileMetrics(metrics) {
    const select = {};
    for (const metricItem of metrics) {
        const { metric, field } = metricItem;
        const col = COLUMN_MAP[field];
        if (!col)
            throw new Error(`Unsupported metric field: ${field}`);
        switch (metric) {
            case "count":
                select[`${metric}_${field}`] = sql `count(${col})::int`;
                break;
            case "sum":
                select[`${metric}_${field}`] = sql `coalesce(sum(${col}), 0)`;
                break;
            case "avg":
                select[`${metric}_${field}`] = sql `coalesce(avg(${col}), 0)`;
                break;
            case "min":
                select[`${metric}_${field}`] = sql `coalesce(min(${col}), 0)`;
                break;
            case "max":
                select[`${metric}_${field}`] = sql `coalesce(max(${col}), 0)`;
                break;
            default:
                throw new Error(`Unsupported metric: ${metric}`);
        }
    }
    return select;
}
export function compileComputations(computations) {
    const select = {};
    for (const computation of computations) {
        switch (computation.name) {
            case "percentile": {
                const { field, percentileValue } = computation;
                const col = COLUMN_MAP[field];
                if (!col)
                    throw new Error(`Unsupported computation field: ${field}`);
                const key = `percentile_${field}_${percentileValue}`;
                select[key] = sql `percentile_cont(${percentileValue / 100}) within group (order by ${col})`;
                break;
            }
            case "avgPricePerM2": {
                const priceCol = propertySales.price;
                const floorAreaCol = propertySales.floorArea;
                const numerator = sql `sum(${priceCol})`;
                const denominator = sql `sum(${floorAreaCol})`;
                select["avgPricePerM2"] = sql `case when ${denominator} > 0 then ${numerator} / ${denominator} else null end`;
                break;
            }
            default:
                throw new Error(`Unsupported computation: ${computation.name}`);
        }
    }
    return Object.keys(select).length > 0 ? select : undefined;
}
