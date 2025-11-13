import type { Row } from "@tanstack/react-table";
import type { MetricTableRow } from "./types";
import { useMetricTableContext } from "./MetricTableShared";
import {
  MetricValueCell,
  PercentChangeCell,
  CountCell,
} from "./MetricTableCell";

export function MetricTableExpandedRow<TRow extends MetricTableRow>({
  row,
  columnCount,
}: {
  row: Row<TRow>;
  columnCount: number;
}) {
  const { metric, metricLabel } = useMetricTableContext();

  if (!row.getIsExpanded() || row.original.yearlyBreakdown.length === 0) {
    return null;
  }

  return (
    <tr className="bg-gray-50">
      <td colSpan={columnCount} className="px-12 pb-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {metricLabel}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  YoY %
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody>
              {row.original.yearlyBreakdown.map((yearRow) => (
                <tr
                  key={`${row.id}-${yearRow.year}`}
                  className="odd:bg-white even:bg-gray-50"
                >
                  <td className="px-4 py-2 text-gray-700 text-xs font-medium">
                    {yearRow.year}
                  </td>
                  <td className="px-4 py-2">
                    <MetricValueCell
                      value={yearRow.metricValue}
                      metric={metric}
                      alignment="start"
                      className="text-xs text-gray-700"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <PercentChangeCell
                      value={yearRow.metricPctChange}
                      alignment="start"
                      className="text-xs text-gray-700"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CountCell
                      value={yearRow.totalSales}
                      alignment="start"
                      className="text-xs text-gray-700"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}
