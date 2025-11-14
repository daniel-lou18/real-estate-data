import { z } from "zod";
import * as schemas from "./base.schemas";

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
  level: schemas.LEVEL_SCHEMA,
  propertyType: schemas.PROPERTY_TYPE_SCHEMA,
  field: schemas.METRIC_FIELD_SCHEMA,
  inseeCode: schemas.INSEE_CODE_SCHEMA.optional().describe(
    "Will be used to filter section level features by INSEE code"
  ),
  year: schemas.YEAR_SCHEMA.default(2024),
  month: schemas.MONTH_SCHEMA.optional(),
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

const MetricSchema = z.object({
  metricName: schemas.METRIC_FIELD_SCHEMA.describe(
    "The name of the metric to display"
  ),
  metricValue: z
    .number()
    .nullable()
    .describe("The value of the metric to display"),
});

export const MapCommunePropertiesSchema = z.object({
  id: schemas.INSEE_CODE_SCHEMA.describe(
    "The id is the INSEE code of the commune, 5 characters long"
  ),
  name: z.string().describe("The name of the commune"),
  ...MetricSchema.shape,
});

export const MapSectionPropertiesSchema = z.object({
  id: schemas.SECTION_SCHEMA.describe(
    "The id is the full section code: inseeCode + prefix + code"
  ),
  inseeCode: schemas.INSEE_CODE_SCHEMA.describe(
    "The INSEE code of the section, 5 characters long"
  ),
  section: schemas.SECTION_SCHEMA.describe(
    "The full section code: inseeCode + prefix + code"
  ),
  prefix: z.string().describe("The prefix of the section, 3 characters long"),
  code: z.string().describe("The code of the section, 2 characters long"),
  ...MetricSchema.shape,
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
  field: schemas.METRIC_FIELD_SCHEMA,
  method: z.literal("quantile"), // Currently only quantile is supported
  buckets: z.array(LegendBucketSchema),
  breaks: z.array(z.number()),
  stats: LegendStats,
});
