import z from "zod";
import { AggregateMetricsMV } from "@/routes/sales/mv/mv.schemas";

export type AggregateMetricsMVKey = keyof AggregateMetricsMV;
export const allowedMetrics = Object.keys(
  AggregateMetricsMV.shape
) as AggregateMetricsMVKey[];

// GeoJSON Position = [longitude, latitude]
const PositionSchema = z.tuple([z.number(), z.number()]);

// GeoJSON LinearRing = Position[] with first == last (not enforced here)
const LinearRingSchema = z.array(PositionSchema);

// GeoJSON Polygon = LinearRing[] (first is outer ring, others holes)
const PolygonCoordinatesSchema = z.array(LinearRingSchema);

// GeoJSON MultiPolygon = Polygon[]
export const MultiPolygonCoordinatesSchema = z.array(PolygonCoordinatesSchema);

const PaginationParams = z.object({
  limit: z.coerce.number().int().min(1).max(5000).default(5000),
  offset: z.coerce.number().int().min(0).default(0),
});

export const MapFeatureParamsSchema = z.object({
  level: z.enum(["commune", "section"]).default("commune"),
  propertyType: z.enum(["house", "apartment"]).default("apartment"),
  field: z.enum(allowedMetrics),
  year: z.coerce.number().int().default(2024),
  month: z.coerce.number().int().min(1).max(12).optional(),
  bbox: z
    .tuple([
      z.coerce.number(),
      z.coerce.number(),
      z.coerce.number(),
      z.coerce.number(),
    ])
    .describe("Bounding box [minLng, minLat, maxLng, maxLat] in EPSG:4326")
    .default([2.2242, 48.8156, 2.4699, 48.9021]),
  ...PaginationParams.shape,
});

const MapFeatureSchema = z.object({
  type: z.literal("Feature"),
  id: z.string(),
  geometry: z.object({
    type: z.literal("MultiPolygon"),
    coordinates: MultiPolygonCoordinatesSchema,
  }),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export const MapCommunePropertiesSchema = z.object({
  id: z.string().describe("The id is the INSEE code"),
  name: z.string(),
  metricName: z.enum(allowedMetrics),
  metricValue: z.number().nullable(),
});

export const MapSectionPropertiesSchema = z.object({
  id: z.string().describe("The id is the full section code"),
  inseeCode: z.string(),
  section: z.string(),
  prefix: z.string(),
  code: z.string(),
  metricName: z.enum(allowedMetrics),
  metricValue: z.number().nullable(),
});

export const MapCommuneFeatureSchema = MapFeatureSchema.extend({
  properties: MapCommunePropertiesSchema,
});

export const MapSectionFeatureSchema = MapFeatureSchema.extend({
  properties: MapSectionPropertiesSchema,
});

export const MapCommuneFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(MapCommuneFeatureSchema),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export const MapSectionFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(MapSectionFeatureSchema),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export const MapFeatureCollectionSchema = z.discriminatedUnion("type", [
  MapCommuneFeatureCollectionSchema,
  MapSectionFeatureCollectionSchema,
]);

// Legend

export const LegendBucketSchema = z.object({
  min: z.number().nullable(),
  max: z.number().nullable(),
  label: z.string(),
  count: z.number(),
});

export const LegendStats = z.object({
  min: z.number().nullable(),
  max: z.number().nullable(),
  median: z.number().nullable(),
  count: z.number(),
});

export const LegendSchema = z.object({
  field: z.enum(allowedMetrics),
  method: z.literal("quantile"), // Currently only quantile is supported
  buckets: z.array(LegendBucketSchema),
  breaks: z.array(z.number()),
  stats: LegendStats,
});

export type MapFeatureParams = z.infer<typeof MapFeatureParamsSchema>;
export type MapCommuneProperties = z.infer<typeof MapCommunePropertiesSchema>;
export type MapSectionProperties = z.infer<typeof MapSectionPropertiesSchema>;
export type MapCommuneFeatureCollection = z.infer<
  typeof MapCommuneFeatureCollectionSchema
>;
export type MapSectionFeatureCollection = z.infer<
  typeof MapSectionFeatureCollectionSchema
>;
export type Legend = z.infer<typeof LegendSchema>;
