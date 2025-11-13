import type { MetricField } from "@/types/metrics";
import type { FeatureLevel, PropertyType } from "@/types/dimensions";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

export type BaseFeatureProperties = {
  metricName: MetricField;
  metricValue: number | null;
  [key: string]: string | number | null | undefined;
};

export interface CommuneFeatureProperties extends BaseFeatureProperties {
  id: string;
  name: string;
}

export interface SectionFeatureProperties extends BaseFeatureProperties {
  id: string;
  inseeCode: string;
  section: string;
  prefix: string;
  code: string;
}

export type MapFeatureProperties =
  | CommuneFeatureProperties
  | SectionFeatureProperties;

export type MapFeature = Feature<MultiPolygon, MapFeatureProperties>;
export type CommuneFeature = Feature<MultiPolygon, CommuneFeatureProperties>;
export type SectionFeature = Feature<MultiPolygon, SectionFeatureProperties>;

export type MapFeatureCollection = FeatureCollection<
  MultiPolygon,
  MapFeatureProperties
>;

export interface MapLegendBucket {
  min: number | null;
  max: number | null;
  label: string;
  count: number;
}

export interface MapLegendStats {
  min: number | null;
  max: number | null;
  median: number | null;
  count: number;
}

export interface MapLegendResponse {
  field: MetricField;
  method: "quantile";
  buckets: MapLegendBucket[];
  breaks: number[];
  stats: MapLegendStats;
}

export interface MapFeatureParams {
  level?: FeatureLevel;
  propertyType?: PropertyType;
  field?: MetricField;
  year?: number;
  month?: number;
  bbox?: [number, number, number, number];
  limit?: number;
  offset?: number;
  inseeCodes?: string[];
  sections?: string[];
}

export type MapLegendParams = MapFeatureParams;
