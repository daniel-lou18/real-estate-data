import { db } from "@/db";
import { communesGeom, sectionsGeom, apartments_by_insee_code_month, apartments_by_insee_code_year, houses_by_insee_code_month, houses_by_insee_code_year, houses_by_section_year, houses_by_section_month, apartments_by_section_month, apartments_by_section_year, } from "@/db/schema";
import {} from "@/routes/sales/map/map.schemas";
import { and, eq, sql } from "drizzle-orm";
export function getMv(level, propertyType, useMonth) {
    if (level === "commune" && propertyType === "apartment") {
        return useMonth
            ? apartments_by_insee_code_month
            : apartments_by_insee_code_year;
    }
    else if (level === "commune" && propertyType === "house") {
        return useMonth ? houses_by_insee_code_month : houses_by_insee_code_year;
    }
    else if (level === "section" && propertyType === "apartment") {
        return useMonth ? apartments_by_section_month : apartments_by_section_year;
    }
    else if (level === "section" && propertyType === "house") {
        return useMonth ? houses_by_section_month : houses_by_section_year;
    }
    throw new Error(`Invalid combination of level, propertyType, and useMonth: ${level}, ${propertyType}, ${useMonth}`);
}
function ensureMultiPolygon(value) {
    if (typeof value !== "string" || value.length === 0)
        return null;
    try {
        const parsed = JSON.parse(value);
        if (parsed?.type === "MultiPolygon" && Array.isArray(parsed.coordinates)) {
            return parsed;
        }
    }
    catch {
        return null;
    }
    return null;
}
function extendBbox(current, geometry) {
    let minX = current?.[0] ?? Number.POSITIVE_INFINITY;
    let minY = current?.[1] ?? Number.POSITIVE_INFINITY;
    let maxX = current?.[2] ?? Number.NEGATIVE_INFINITY;
    let maxY = current?.[3] ?? Number.NEGATIVE_INFINITY;
    for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
            for (const [x, y] of ring) {
                if (x < minX)
                    minX = x;
                if (y < minY)
                    minY = y;
                if (x > maxX)
                    maxX = x;
                if (y > maxY)
                    maxY = y;
            }
        }
    }
    return [minX, minY, maxX, maxY];
}
function assertFiniteMetric(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
}
export function buildSpatialEnvelope(bbox) {
    return sql `ST_MakeEnvelope(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]}, 4326)`;
}
export function buildTimeConditions(mv, year, month) {
    const conditions = [eq(mv.year, year)];
    if (typeof month === "number") {
        conditions.push(eq(mv.month, month));
    }
    return conditions;
}
function computeCollectionBbox(features) {
    let bbox;
    for (const feature of features) {
        bbox = extendBbox(bbox, feature.geometry);
    }
    return bbox;
}
async function fetchCommuneFeatures(params) {
    const { mv, field, year, month, bbox, limit, offset } = params;
    const metricColumn = mv[field];
    if (!metricColumn) {
        throw new Error(`Metric "${field}" not found on commune materialized view`);
    }
    const metricValue = sql `${metricColumn}`.as("metricValue");
    const conditions = buildTimeConditions(mv, year, month);
    const envelope = buildSpatialEnvelope(bbox);
    conditions.push(sql `ST_Intersects(${communesGeom.geom}, ${envelope})`);
    const rows = await db
        .select({
        id: communesGeom.inseeCode,
        name: communesGeom.name,
        geometry: sql `ST_AsGeoJSON(${communesGeom.geom})`.as("geometry"),
        metricValue,
    })
        .from(communesGeom)
        .leftJoin(mv, sql `${communesGeom.inseeCode} = ${mv}.insee_code`)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);
    return rows
        .map((row) => {
        const geometry = ensureMultiPolygon(row.geometry);
        if (!geometry)
            return null;
        const metricValue = assertFiniteMetric(row.metricValue);
        return {
            type: "Feature",
            id: row.id,
            geometry,
            properties: {
                id: row.id,
                name: row.name ?? "",
                metricName: field,
                metricValue,
            },
        };
    })
        .filter((feature) => feature !== null);
}
async function fetchSectionFeatures(params) {
    const { mv, field, year, month, bbox, limit, offset } = params;
    const metricColumn = mv[field];
    if (!metricColumn) {
        throw new Error(`Metric "${field}" not found on section materialized view`);
    }
    const metricValue = sql `${metricColumn}`.as("metricValue");
    const conditions = buildTimeConditions(mv, year, month);
    const envelope = buildSpatialEnvelope(bbox);
    conditions.push(sql `ST_Intersects(${sectionsGeom.geom}, ${envelope})`);
    const rows = await db
        .select({
        id: sectionsGeom.section,
        inseeCode: sectionsGeom.inseeCode,
        section: sectionsGeom.section,
        prefix: sectionsGeom.prefix,
        code: sectionsGeom.code,
        geometry: sql `ST_AsGeoJSON(${sectionsGeom.geom})`.as("geometry"),
        metricValue,
    })
        .from(sectionsGeom)
        .leftJoin(mv, sql `${sectionsGeom.section} = ${mv}.section`)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);
    return rows
        .map((row) => {
        const geometry = ensureMultiPolygon(row.geometry);
        if (!geometry)
            return null;
        const metricValue = assertFiniteMetric(row.metricValue);
        return {
            type: "Feature",
            id: row.id,
            geometry,
            properties: {
                id: row.id,
                inseeCode: row.inseeCode ?? "",
                section: row.section ?? "",
                prefix: row.prefix ?? "",
                code: row.code ?? "",
                metricName: field,
                metricValue,
            },
        };
    })
        .filter((feature) => feature !== null);
}
export async function getMapFeatures(params) {
    const { level, propertyType, field, year, month, bbox, limit, offset } = params;
    const useMonth = typeof month === "number";
    const paginationParams = {
        limit: limit ?? 5000,
        offset: offset ?? 0,
    };
    if (level === "commune") {
        const mv = getMv("commune", propertyType, useMonth);
        const features = await fetchCommuneFeatures({
            mv,
            field,
            year,
            month,
            bbox,
            ...paginationParams,
        });
        return {
            type: "FeatureCollection",
            features,
            bbox: features.length ? computeCollectionBbox(features) : undefined,
        };
    }
    const mv = getMv("section", propertyType, useMonth);
    const features = await fetchSectionFeatures({
        mv,
        field,
        year,
        month,
        bbox,
        ...paginationParams,
    });
    return {
        type: "FeatureCollection",
        features,
        bbox: features.length ? computeCollectionBbox(features) : undefined,
    };
}
