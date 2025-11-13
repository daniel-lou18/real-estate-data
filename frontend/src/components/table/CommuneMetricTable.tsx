import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  MetricTableBody,
  MetricTableContainer,
  MetricTableHeader,
  type TableStatus,
} from "./MetricTableShared";
import { CountCell, MetricValueCell, SparklineCell } from "./MetricTableCell";
import { DimensionTableCell } from "./DimensionTableCell";
import { METRIC_CATALOG } from "@/constants/catalog";
import type {
  CommuneTableData,
  CommuneMetricRow,
  NumericMetricField,
  CommuneYoYTableData,
} from "./types";
import {
  groupDataByKey,
  groupYoYDataByKey,
  transformBreakdownToTableRows,
} from "./tableDataHelpers";

const columnHelper = createColumnHelper<CommuneMetricRow>();

interface CommuneMetricTableProps {
  data: CommuneYoYTableData[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  metric: NumericMetricField;
  selectedYear?: number;
  hoveredRowId: string | null;
  setHoveredRowId: Dispatch<SetStateAction<string | null>>;
}

export function CommuneMetricTable({
  data = [],
  isLoading,
  isError,
  error,
  metric,
  selectedYear,
  hoveredRowId,
  setHoveredRowId,
}: CommuneMetricTableProps) {
  const breakdownByCommune = useMemo(
    () => groupYoYDataByKey(data, metric, (item) => item.inseeCode),
    [data, metric]
  );

  const tableData = useMemo<CommuneMetricRow[]>(
    () =>
      transformBreakdownToTableRows(
        breakdownByCommune,
        (inseeCode, breakdown, selectedRow) =>
          ({
            inseeCode,
            metricValue: selectedRow?.metricValue ?? null,
            totalSales: selectedRow?.totalSales ?? null,
            yearlyBreakdown: breakdown,
          }) satisfies CommuneMetricRow,
        selectedYear
      ),
    [breakdownByCommune, selectedYear]
  );

  const metricMetadata = METRIC_CATALOG[metric];
  const metricLabel = metricMetadata?.label ?? metric;

  const columns = useMemo(
    () => [
      columnHelper.accessor("inseeCode", {
        header: "Commune",
        cell: ({ row, getValue }) => (
          <DimensionTableCell
            label={getValue() ?? "—"}
            canExpand={row.getCanExpand()}
            isExpanded={row.getIsExpanded()}
            onToggleExpand={row.getToggleExpandedHandler()}
          />
        ),
      }),
      columnHelper.accessor("metricValue", {
        header: metricLabel,
        cell: ({ getValue }) => (
          <MetricValueCell value={getValue()} metric={metric} />
        ),
        meta: { className: "text-right" },
      }),
      columnHelper.display({
        id: "trend",
        header: "Trend",
        cell: ({ row }) => (
          <SparklineCell
            values={row.original.yearlyBreakdown
              .slice()
              .reverse()
              .map((entry) => entry.metricValue)}
            alignment="end"
          />
        ),
        meta: { className: "text-right" },
      }),
      columnHelper.accessor("totalSales", {
        header: "N° Sales",
        cell: ({ getValue }) => <CountCell value={getValue()} />,
        meta: { className: "text-right" },
      }),
    ],
    [metric, metricLabel]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.yearlyBreakdown.length > 1,
    enableRowSelection: true,
  });

  const rows = table.getRowModel().rows;
  const status: TableStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : rows.length === 0
        ? "empty"
        : "ready";

  return (
    <MetricTableContainer
      status={status}
      error={error}
      table={table}
      metric={metric}
      metricLabel={metricLabel}
      hoveredRowId={hoveredRowId}
      setHoveredRowId={setHoveredRowId}
    >
      <table className="w-full">
        <MetricTableHeader />
        <MetricTableBody />
      </table>
    </MetricTableContainer>
  );
}
