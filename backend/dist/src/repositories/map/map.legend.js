import { db } from "@/db";
import { communesGeom, sectionsGeom } from "@/db/schema";
import { and, sql } from "drizzle-orm";
import { getMv, buildTimeConditions, buildSpatialEnvelope, } from "./map.features";
// Custom mapper that converts to number but preserves null
const mapToNumber = (value) => {
    if (value === null || value === undefined)
        return null;
    return Number(value);
};
// Mapper for arrays that filters out nulls and converts to numbers
const mapToNumberArray = (arr) => {
    if (!Array.isArray(arr))
        return [];
    return arr
        .map((v) => (v === null || v === undefined ? null : Number(v)))
        .filter((v) => v !== null);
};
function buildQuantileBreaks(bucketsCount) {
    const percentiles = [];
    for (let i = 1; i < bucketsCount; i++) {
        percentiles.push(i / bucketsCount);
    }
    return percentiles;
}
function formatBucketLabel(min, max) {
    if (min === null && max === null)
        return "No data";
    if (min === null)
        return `≤ ${max?.toLocaleString()}`;
    if (max === null)
        return `> ${min.toLocaleString()}`;
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
}
async function computeCommuneLegend(params) {
    const { mv, field, year, month, bbox, bucketsCount } = params;
    const metricColumn = mv[field];
    if (!metricColumn) {
        throw new Error(`Metric "${field}" not found on commune materialized view`);
    }
    const conditions = buildTimeConditions(mv, year, month);
    conditions.push(sql `${metricColumn} IS NOT NULL`);
    if (bbox) {
        const envelope = buildSpatialEnvelope(bbox);
        conditions.push(sql `ST_Intersects(${communesGeom.geom}, ${envelope})`);
    }
    // Build percentile expressions
    const percentiles = buildQuantileBreaks(bucketsCount);
    const percentileExprs = percentiles.map((p) => sql `percentile_cont(${p}) WITHIN GROUP (ORDER BY ${metricColumn})`);
    const [result] = await db
        .select({
        min: sql `min(${metricColumn})`.mapWith(mapToNumber),
        max: sql `max(${metricColumn})`.mapWith(mapToNumber),
        median: sql `percentile_cont(0.5) WITHIN GROUP (ORDER BY ${metricColumn})`.mapWith(mapToNumber),
        count: sql `count(${metricColumn})::int`,
        breaks: sql `ARRAY[${sql.join(percentileExprs, sql `, `)}]`.mapWith(mapToNumberArray),
    })
        .from(communesGeom)
        .leftJoin(mv, sql `${communesGeom.inseeCode} = ${mv}.insee_code`)
        .where(and(...conditions));
    return result;
}
async function computeSectionLegend(params) {
    const { mv, field, inseeCode, year, month, bbox, bucketsCount } = params;
    const metricColumn = mv[field];
    if (!metricColumn) {
        throw new Error(`Metric "${field}" not found on section materialized view`);
    }
    const conditions = buildTimeConditions(mv, year, month);
    conditions.push(sql `${metricColumn} IS NOT NULL`);
    if (inseeCode) {
        conditions.push(sql `${sectionsGeom.inseeCode} = ${inseeCode}`);
    }
    if (bbox) {
        const envelope = buildSpatialEnvelope(bbox);
        conditions.push(sql `ST_Intersects(${sectionsGeom.geom}, ${envelope})`);
    }
    // Build percentile expressions
    const percentiles = buildQuantileBreaks(bucketsCount);
    const percentileExprs = percentiles.map((p) => sql `percentile_cont(${p}) WITHIN GROUP (ORDER BY ${metricColumn})`);
    const [result] = await db
        .select({
        min: sql `min(${metricColumn})`.mapWith(mapToNumber),
        max: sql `max(${metricColumn})`.mapWith(mapToNumber),
        median: sql `percentile_cont(0.5) WITHIN GROUP (ORDER BY ${metricColumn})`.mapWith(mapToNumber),
        count: sql `count(${metricColumn})::int`,
        breaks: sql `ARRAY[${sql.join(percentileExprs, sql `, `)}]`.mapWith(mapToNumberArray),
    })
        .from(sectionsGeom)
        .leftJoin(mv, sql `${sectionsGeom.section} = ${mv}.section`)
        .where(and(...conditions));
    return result;
}
async function countInBucket(params) {
    const { mv, field, year, month, inseeCode, bbox, min, max, level, isLastBucket = false, } = params;
    const metricColumn = mv[field];
    if (!metricColumn)
        return 0;
    const conditions = buildTimeConditions(mv, year, month);
    conditions.push(sql `${metricColumn} IS NOT NULL`);
    if (level === "section" && inseeCode) {
        conditions.push(sql `${sectionsGeom.inseeCode} = ${inseeCode}`);
    }
    if (min !== null) {
        // Cast to numeric to handle comparison with integer columns
        conditions.push(sql `${metricColumn}::numeric >= ${min}`);
    }
    if (max !== null) {
        // Cast to numeric to handle comparison with integer columns
        // Use <= for last bucket to include the max value, < for others
        const operator = isLastBucket ? sql `<=` : sql `<`;
        conditions.push(sql `${metricColumn}::numeric ${operator} ${max}`);
    }
    const geomTable = level === "commune" ? communesGeom : sectionsGeom;
    const joinCondition = level === "commune"
        ? sql `${communesGeom.inseeCode} = ${mv}.insee_code`
        : sql `${sectionsGeom.section} = ${mv}.section`;
    if (bbox) {
        const envelope = buildSpatialEnvelope(bbox);
        conditions.push(sql `ST_Intersects(${geomTable.geom}, ${envelope})`);
    }
    const [result] = await db
        .select({
        count: sql `count(${metricColumn})::int`,
    })
        .from(geomTable)
        .leftJoin(mv, joinCondition)
        .where(and(...conditions));
    return result?.count ?? 0;
}
export async function getLegend(params) {
    const { level, propertyType, field, inseeCode, year, month, bbox, bucketsCount = 10, } = params;
    const useMonth = typeof month === "number";
    const mv = level === "commune"
        ? getMv("commune", propertyType, useMonth)
        : getMv("section", propertyType, useMonth);
    // Compute quantiles and stats
    const statsResult = level === "commune"
        ? await computeCommuneLegend({
            mv: mv,
            field,
            year,
            month,
            bbox,
            bucketsCount,
        })
        : await computeSectionLegend({
            mv: mv,
            field,
            inseeCode,
            year,
            month,
            bbox,
            bucketsCount,
        });
    const { min, max, median, count, breaks } = statsResult;
    // Build bucket boundaries: [min, break1, break2, ..., max]
    const boundaries = [min, ...breaks, max];
    // Count features in each bucket
    const buckets = await Promise.all(boundaries.slice(0, -1).map(async (bucketMin, i) => {
        const bucketMax = boundaries[i + 1];
        const isLastBucket = i === boundaries.length - 2;
        const bucketCount = await countInBucket({
            mv,
            field,
            year,
            month,
            inseeCode,
            bbox,
            min: bucketMin,
            max: bucketMax,
            level,
            isLastBucket,
        });
        return {
            min: bucketMin,
            max: bucketMax,
            label: formatBucketLabel(bucketMin, bucketMax),
            count: bucketCount,
        };
    }));
    return {
        field,
        method: "quantile",
        buckets,
        breaks,
        stats: {
            min,
            max,
            median,
            count,
        },
    };
}
