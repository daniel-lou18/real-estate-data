import type {
  APARTMENT_COMPOSITION_FIELDS,
  HOUSE_COMPOSITION_FIELDS,
  METRIC_FIELDS,
} from "../constants/base";

export type MetricField = (typeof METRIC_FIELDS)[number];

export type MetricPercentChangeField = `${MetricField}_pct_change`;

export type MetricType = "measure" | "percentage" | "count" | "ratio";

export type MetricGroup = "pricing" | "area" | "composition" | "volume";

export type MetricCatalogItem = {
  id: MetricField;
  label: string;
  group?: MetricGroup;
  unit?: string;
  digits?: { minimum?: number; maximum?: number };
  type?: MetricType;
  columnTemplate?: ColumnTemplate[]; // how to display the metric in the table
};

export type ColumnTemplate =
  | "value" // single numeric value
  | "count"
  | "delta" // base/current/abs delta/pct
  | "deltaCompact" // pct with arrow and total sales
  | "sparkline" // small inline series
  | "slope" // linear trend slope
  | "qualityBadge"; // data quality indicator

export type ApartmentCompositionField =
  (typeof APARTMENT_COMPOSITION_FIELDS)[number];
export type HouseCompositionField = (typeof HOUSE_COMPOSITION_FIELDS)[number];
