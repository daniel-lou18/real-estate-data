import { db } from "@/db";
import {
  communesGeom,
  sectionsGeom,
  apartments_by_insee_code_month,
  apartments_by_insee_code_year,
  houses_by_insee_code_month,
  houses_by_insee_code_year,
  houses_by_section_year,
  houses_by_section_month,
  apartments_by_section_month,
  apartments_by_section_year,
} from "@/db/schema";
import {
  type MapFeatureParams,
  type MapCommuneFeatureCollection,
  type MapSectionFeatureCollection,
  type MetricField,
} from "@app/shared";
import { and, eq, sql } from "drizzle-orm";

type GetMapFeaturesParams = MapFeatureParams & {
  bbox: [number, number, number, number];
};

export type CommuneMV =
  | typeof apartments_by_insee_code_month
  | typeof houses_by_insee_code_month
  | typeof apartments_by_insee_code_year
  | typeof houses_by_insee_code_year;
export type SectionMV =
  | typeof apartments_by_section_month
  | typeof houses_by_section_month
  | typeof apartments_by_section_year
  | typeof houses_by_section_year;

export function getMv(
  level: "commune" | "section",
  propertyType: "apartment" | "house",
  useMonth: boolean
) {
  if (level === "commune" && propertyType === "apartment") {
    return useMonth
      ? apartments_by_insee_code_month
      : apartments_by_insee_code_year;
  } else if (level === "commune" && propertyType === "house") {
    return useMonth ? houses_by_insee_code_month : houses_by_insee_code_year;
  } else if (level === "section" && propertyType === "apartment") {
    return useMonth ? apartments_by_section_month : apartments_by_section_year;
  } else if (level === "section" && propertyType === "house") {
    return useMonth ? houses_by_section_month : houses_by_section_year;
  }
  throw new Error(
    `Invalid combination of level, propertyType, and useMonth: ${level}, ${propertyType}, ${useMonth}`
  );
}

type MapFeatureCollection =
  | MapCommuneFeatureCollection
  | MapSectionFeatureCollection;

type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

function ensureMultiPolygon(value: unknown): MultiPolygonGeometry | null {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    const parsed = JSON.parse(value) as MultiPolygonGeometry;
    if (parsed?.type === "MultiPolygon" && Array.isArray(parsed.coordinates)) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function extendBbox(
  current: [number, number, number, number] | undefined,
  geometry: MultiPolygonGeometry
): [number, number, number, number] {
  let minX = current?.[0] ?? Number.POSITIVE_INFINITY;
  let minY = current?.[1] ?? Number.POSITIVE_INFINITY;
  let maxX = current?.[2] ?? Number.NEGATIVE_INFINITY;
  let maxY = current?.[3] ?? Number.NEGATIVE_INFINITY;

  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return [minX, minY, maxX, maxY];
}

function assertFiniteMetric(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function buildSpatialEnvelope(bbox: [number, number, number, number]) {
  return sql`ST_MakeEnvelope(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]}, 4326)`;
}

export function buildTimeConditions<T extends CommuneMV | SectionMV>(
  mv: T,
  year: number,
  month?: number
) {
  const conditions: any[] = [eq((mv as any).year, year)];

  if (typeof month === "number") {
    conditions.push(eq((mv as any).month, month));
  }

  return conditions;
}

function computeCollectionBbox(
  features: Array<{ geometry: MultiPolygonGeometry }>
): [number, number, number, number] | undefined {
  let bbox: [number, number, number, number] | undefined;
  for (const feature of features) {
    bbox = extendBbox(bbox, feature.geometry);
  }
  return bbox;
}

async function fetchCommuneFeatures(params: {
  mv: CommuneMV;
  field: MetricField;
  year: number;
  month?: number;
  bbox: [number, number, number, number];
  limit: number;
  offset: number;
}) {
  const { mv, field, year, month, bbox, limit, offset } = params;

  const metricColumn = mv[field as keyof typeof mv];
  if (!metricColumn) {
    throw new Error(`Metric "${field}" not found on commune materialized view`);
  }

  const metricValue = sql<number>`${metricColumn}`.as("metricValue");
  const conditions = buildTimeConditions(mv, year, month);
  const envelope = buildSpatialEnvelope(bbox);
  conditions.push(sql`ST_Intersects(${communesGeom.geom}, ${envelope})`);

  const rows = await db
    .select({
      id: communesGeom.inseeCode,
      name: communesGeom.name,
      geometry: sql<string>`ST_AsGeoJSON(${communesGeom.geom})`.as("geometry"),
      metricValue,
    })
    .from(communesGeom)
    .leftJoin(mv, sql`${communesGeom.inseeCode} = ${mv}.insee_code`)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);

  return rows
    .map((row) => {
      const geometry = ensureMultiPolygon(row.geometry);
      if (!geometry) return null;
      const metricValue = assertFiniteMetric(row.metricValue);
      return {
        type: "Feature" as const,
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
    .filter(
      (feature): feature is MapCommuneFeatureCollection["features"][number] =>
        feature !== null
    );
}

async function fetchSectionFeatures(params: {
  mv: SectionMV;
  field: MetricField;
  year: number;
  month?: number;
  bbox: [number, number, number, number];
  limit: number;
  offset: number;
}) {
  const { mv, field, year, month, bbox, limit, offset } = params;

  const metricColumn = mv[field as keyof typeof mv];
  if (!metricColumn) {
    throw new Error(`Metric "${field}" not found on section materialized view`);
  }

  const metricValue = sql<number>`${metricColumn}`.as("metricValue");
  const conditions = buildTimeConditions(mv, year, month);
  const envelope = buildSpatialEnvelope(bbox);
  conditions.push(sql`ST_Intersects(${sectionsGeom.geom}, ${envelope})`);

  const rows = await db
    .select({
      id: sectionsGeom.section,
      inseeCode: sectionsGeom.inseeCode,
      section: sectionsGeom.section,
      prefix: sectionsGeom.prefix,
      code: sectionsGeom.code,
      geometry: sql<string>`ST_AsGeoJSON(${sectionsGeom.geom})`.as("geometry"),
      metricValue,
    })
    .from(sectionsGeom)
    .leftJoin(mv, sql`${sectionsGeom.section} = ${mv}.section`)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);

  return rows
    .map((row) => {
      const geometry = ensureMultiPolygon(row.geometry);
      if (!geometry) return null;
      const metricValue = assertFiniteMetric(row.metricValue);
      return {
        type: "Feature" as const,
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
    .filter(
      (feature): feature is MapSectionFeatureCollection["features"][number] =>
        feature !== null
    );
}

export async function getMapFeatures(
  params: GetMapFeaturesParams
): Promise<MapFeatureCollection> {
  const { level, propertyType, field, year, month, bbox, limit, offset } =
    params;
  const useMonth = typeof month === "number";
  const paginationParams = {
    limit: limit ?? 5000,
    offset: offset ?? 0,
  };

  if (level === "commune") {
    const mv = getMv("commune", propertyType, useMonth) as CommuneMV;
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
    } satisfies MapCommuneFeatureCollection;
  }

  const mv = getMv("section", propertyType, useMonth) as SectionMV;
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
  } satisfies MapSectionFeatureCollection;
}
