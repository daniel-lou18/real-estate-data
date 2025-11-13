import type {
  DimensionCatalogItem,
  DimensionField,
  MetricCatalogItem,
  MetricField,
} from "@/types";
import * as baseSchemas from "@/services/api/schemas/base";
import { METRIC_FIELDS } from "./base/metrics";

const TOTAL_SALES: MetricCatalogItem = {
  id: "total_sales",
  label: "N° Sales",
  group: "volume",
  type: "count",
  unit: undefined,
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["count", "deltaCompact"],
};

const TOTAL_PRICE: MetricCatalogItem = {
  id: "total_price",
  label: "Total price",
  group: "pricing",
  type: "measure",
  unit: "€",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const AVG_PRICE: MetricCatalogItem = {
  id: "avg_price",
  label: "Avg price",
  group: "pricing",
  type: "measure",
  unit: "€",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const TOTAL_AREA: MetricCatalogItem = {
  id: "total_area",
  label: "Total area",
  group: "area",
  type: "measure",
  unit: "m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const AVG_AREA: MetricCatalogItem = {
  id: "avg_area",
  label: "Avg area",
  group: "area",
  type: "measure",
  unit: "m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const AVG_PRICE_M2: MetricCatalogItem = {
  id: "avg_price_m2",
  label: "Avg price/m²",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

const MIN_PRICE: MetricCatalogItem = {
  id: "min_price",
  label: "Min price",
  group: "pricing",
  type: "measure",
  unit: "€",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const MAX_PRICE: MetricCatalogItem = {
  id: "max_price",
  label: "Max price",
  group: "pricing",
  type: "measure",
  unit: "€",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const MEDIAN_PRICE: MetricCatalogItem = {
  id: "median_price",
  label: "Median price",
  group: "pricing",
  type: "measure",
  unit: "€",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const MEDIAN_AREA: MetricCatalogItem = {
  id: "median_area",
  label: "Median area",
  group: "area",
  type: "measure",
  unit: "m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "delta"],
};

const MIN_PRICE_M2: MetricCatalogItem = {
  id: "min_price_m2",
  label: "Min price/m²",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

const MAX_PRICE_M2: MetricCatalogItem = {
  id: "max_price_m2",
  label: "Max price/m²",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

const PRICE_M2_P25: MetricCatalogItem = {
  id: "price_m2_p25",
  label: "Price/m² p25",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

const PRICE_M2_P75: MetricCatalogItem = {
  id: "price_m2_p75",
  label: "Price/m² p75",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

const PRICE_M2_IQR: MetricCatalogItem = {
  id: "price_m2_iqr",
  label: "Price/m² IQR",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

const PRICE_M2_STDDEV: MetricCatalogItem = {
  id: "price_m2_stddev",
  label: "Price/m² Std Dev",
  group: "pricing",
  type: "measure",
  unit: "€/m²",
  digits: { minimum: 0, maximum: 0 },
  columnTemplate: ["value", "deltaCompact"],
};

export const METRIC_CATALOG: Record<MetricField, MetricCatalogItem> = {
  total_sales: TOTAL_SALES,
  total_price: TOTAL_PRICE,
  avg_price: AVG_PRICE,
  total_area: TOTAL_AREA,
  avg_area: AVG_AREA,
  avg_price_m2: AVG_PRICE_M2,
  min_price: MIN_PRICE,
  max_price: MAX_PRICE,
  median_price: MEDIAN_PRICE,
  median_area: MEDIAN_AREA,
  min_price_m2: MIN_PRICE_M2,
  max_price_m2: MAX_PRICE_M2,
  price_m2_p25: PRICE_M2_P25,
  price_m2_p75: PRICE_M2_P75,
  price_m2_iqr: PRICE_M2_IQR,
  price_m2_stddev: PRICE_M2_STDDEV,
} satisfies Record<MetricField, MetricCatalogItem>;

export const METRIC_OPTIONS = METRIC_FIELDS.map((field) => ({
  value: field,
  label: METRIC_CATALOG[field].label,
}));

// DIMENSIONS

const INSEE_CODE: DimensionCatalogItem = {
  id: "inseeCode",
  label: "INSEE Code",
  category: "spatial",
  level: "commune",
  type: baseSchemas.INSEE_CODE_SCHEMA,
};

const SECTION: DimensionCatalogItem = {
  id: "section",
  label: "Section",
  category: "spatial",
  level: "section",
  type: baseSchemas.SECTION_SCHEMA,
};

const YEAR: DimensionCatalogItem = {
  id: "year",
  label: "Year",
  category: "temporal",
  type: baseSchemas.YEAR_SCHEMA,
};

const MONTH: DimensionCatalogItem = {
  id: "month",
  label: "Month",
  category: "temporal",
  type: baseSchemas.MONTH_SCHEMA,
};

const ISO_YEAR: DimensionCatalogItem = {
  id: "iso_year",
  label: "ISO Year",
  category: "temporal",
  type: baseSchemas.ISO_YEAR_SCHEMA,
};

const ISO_WEEK: DimensionCatalogItem = {
  id: "iso_week",
  label: "ISO Week",
  category: "temporal",
  type: baseSchemas.ISO_WEEK_SCHEMA,
};

export const DIMENSION_CATALOG: Record<DimensionField, DimensionCatalogItem> = {
  inseeCode: INSEE_CODE,
  section: SECTION,
  year: YEAR,
  month: MONTH,
  iso_year: ISO_YEAR,
  iso_week: ISO_WEEK,
} satisfies Record<DimensionField, DimensionCatalogItem>;
