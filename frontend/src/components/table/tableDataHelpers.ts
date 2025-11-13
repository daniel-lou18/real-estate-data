import type { MetricPercentChangeField } from "@/types";
import type {
  CommuneTableData,
  SectionTableData,
  CommuneYoYTableData,
  SectionYoYTableData,
  YearBreakdownRow,
  NumericMetricField,
} from "./types";

/**
 * Groups table data by a key and creates YearBreakdownRow arrays.
 * Each group contains all years for that key, sorted by year (descending).
 *
 * @param data - Array of table data items
 * @param metric - The metric field to extract
 * @param getKey - Function to extract the grouping key from each item
 * @returns Map of key to YearBreakdownRow array
 */
export function groupDataByKey<T extends CommuneTableData | SectionTableData>(
  data: T[],
  metric: NumericMetricField,
  getKey: (item: T) => string
): Map<string, YearBreakdownRow[]> {
  const map = new Map<string, YearBreakdownRow[]>();
  const pctChangeKey = `${metric}_pct_change` as MetricPercentChangeField;

  data.forEach((item) => {
    const key = getKey(item);
    const metricValue = item[metric] ?? null;
    const metricPctChange =
      (item[pctChangeKey] as number | null | undefined) ?? null;
    const entry: YearBreakdownRow = {
      year: item.year,
      metricValue,
      metricPctChange,
      totalSales: item.transactions,
    };

    const existing = map.get(key);
    if (existing) {
      existing.push(entry);
    } else {
      map.set(key, [entry]);
    }
  });

  // Sort each group by year (descending)
  map.forEach((rows) => {
    rows.sort((a, b) => b.year - a.year);
  });

  return map;
}

/**
 * Groups YoY table data by a key and creates YearBreakdownRow arrays.
 * Each group contains all years for that key, sorted by year (descending).
 * Extracts metric values from MetricDelta objects (using current and pct_change).
 *
 * @param data - Array of YoY table data items
 * @param metric - The metric field to extract
 * @param getKey - Function to extract the grouping key from each item
 * @returns Map of key to YearBreakdownRow array
 */
export function groupYoYDataByKey<
  T extends CommuneYoYTableData | SectionYoYTableData,
>(
  data: T[],
  metric: NumericMetricField,
  getKey: (item: T) => string
): Map<string, YearBreakdownRow[]> {
  const map = new Map<string, YearBreakdownRow[]>();

  data.forEach((item) => {
    const key = getKey(item);
    const metricDelta = item[metric];
    const metricValue = metricDelta?.current ?? null;
    const metricPctChange = metricDelta?.pct_change ?? null;
    const entry: YearBreakdownRow = {
      year: item.year,
      metricValue,
      metricPctChange,
      totalSales: item.transactions,
    };

    const existing = map.get(key);
    if (existing) {
      existing.push(entry);
    } else {
      map.set(key, [entry]);
    }
  });

  // Sort each group by year (descending)
  map.forEach((rows) => {
    rows.sort((a, b) => b.year - a.year);
  });

  return map;
}

/**
 * Transforms a breakdown map into table rows, selecting the appropriate year
 * and sorting by metric value.
 *
 * @param breakdownMap - Map of key to YearBreakdownRow array
 * @param createRow - Function to create a row from key and breakdown
 * @param selectedYear - Optional year to select (defaults to first/most recent)
 * @returns Array of table rows sorted by metric value (descending)
 */
export function transformBreakdownToTableRows<
  TRow extends {
    metricValue: number | null;
    yearlyBreakdown: YearBreakdownRow[];
  },
>(
  breakdownMap: Map<string, YearBreakdownRow[]>,
  createRow: (
    key: string,
    breakdown: YearBreakdownRow[],
    selectedRow: YearBreakdownRow | undefined
  ) => TRow,
  selectedYear?: number
): TRow[] {
  return Array.from(breakdownMap.entries())
    .map(([key, breakdown]) => {
      const selectedRow =
        selectedYear !== undefined
          ? (breakdown.find((row) => row.year === selectedYear) ?? breakdown[0])
          : breakdown[0];

      return createRow(key, breakdown, selectedRow);
    })
    .sort((a, b) => {
      if (a.metricValue === null) return 1;
      if (b.metricValue === null) return -1;
      return b.metricValue - a.metricValue;
    });
}
