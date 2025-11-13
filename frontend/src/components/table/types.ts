import type { MetricPercentChangeField } from "@/types";
import type { MetricDelta } from "@/services/api/types";
import type { AggregateMetricsMV, DimensionField, MetricField } from "@/types";

export type CommuneTableData = {
  inseeCode: string;
  year: number;
  transactions: number;
} & MetricData;

export type SectionTableData = CommuneTableData & {
  section: string;
};

export type CommuneYoYTableData = {
  inseeCode: string;
  year: number;
  base_year: number;
  transactions: number;
} & MetricDeltaData;

export type SectionYoYTableData = CommuneYoYTableData & {
  section: string;
};

export type MetricDeltaData = Partial<Record<MetricField, MetricDelta>>;

export type MetricData = Partial<
  Record<MetricField | MetricPercentChangeField, number | null>
>;

export type TableData = Partial<Record<DimensionField, string | number>> &
  MetricData;

export interface YearBreakdownRow {
  year: number;
  metricValue: number | null;
  metricPctChange: number | null;
  totalSales: number | null;
}

export interface MetricRowBase {
  metricValue: number | null;
  totalSales: number | null;
  yearlyBreakdown: YearBreakdownRow[];
}

export interface CommuneMetricRow extends MetricRowBase {
  inseeCode: string;
}

export interface SectionMetricRow extends MetricRowBase {
  section: string;
}

export type MetricTableRow = CommuneMetricRow | SectionMetricRow;

export type NumericMetricField = {
  [K in MetricField]: AggregateMetricsMV[K] extends number ? K : never;
}[MetricField];
