import {
  createContext,
  Fragment,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { MetricTableExpandedRow } from "./MetricTableExpandedRow";
import type { MetricTableRow, NumericMetricField } from "./types";
import { cn } from "@/lib/utils";

export type TableStatus = "loading" | "error" | "empty" | "ready";

export type MetricTableContextValue<TRow extends MetricTableRow> = {
  table: Table<TRow> | null;
  metric: NumericMetricField;
  metricLabel: string;
  hoveredRowId: string | null;
  setHoveredRowId: Dispatch<SetStateAction<string | null>>;
};

export const MetricTableContext =
  createContext<MetricTableContextValue<MetricTableRow> | null>(null);

export function useMetricTableContext() {
  const context = useContext(MetricTableContext);
  if (!context) {
    throw new Error(
      "useMetricTableContext must be used within a MetricTableContainer"
    );
  }
  return context as MetricTableContextValue<MetricTableRow>;
}

type MetricTableContainerProps<TRow extends MetricTableRow> = {
  status: TableStatus;
  error: unknown;
  children: ReactNode;
} & MetricTableContextValue<TRow>;

export function MetricTableContainer<TRow extends MetricTableRow>({
  status,
  error,
  children,
  ...contextProps
}: MetricTableContainerProps<TRow>) {
  return (
    <MetricTableContext.Provider
      value={contextProps as MetricTableContextValue<MetricTableRow>}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          {status === "loading" ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading metrics…</p>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load metrics.</p>
              {error instanceof Error && (
                <p className="mt-2 text-sm text-red-400">{error.message}</p>
              )}
            </div>
          ) : status === "empty" ? (
            <div className="text-center py-8 text-gray-500">
              <p>No data available</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </MetricTableContext.Provider>
  );
}

export function MetricTableHeader() {
  const { table } = useMetricTableContext();

  if (!table) {
    return null;
  }

  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="border-b border-gray-200">
          <th className="px-4 py-3 text-left">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              ref={(el) => {
                if (el) el.indeterminate = table.getIsSomeRowsSelected();
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </th>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort?.() ?? false;
            const sortingState = header.column.getIsSorted();
            const sortingIndicator =
              sortingState === "asc"
                ? "↑"
                : sortingState === "desc"
                  ? "↓"
                  : "↕";

            return (
              <th
                key={header.id}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header.isPlaceholder ? null : canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                    <span className="text-gray-400">{sortingIndicator}</span>
                  </button>
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

export function MetricTableBody() {
  const { table } = useMetricTableContext();

  if (!table) {
    return null;
  }

  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleFlatColumns().length + 1;

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rows.map((row) => (
        <Fragment key={row.id}>
          <MetricTableRow row={row} />
          <MetricTableExpandedRow row={row} columnCount={columnCount} />
        </Fragment>
      ))}
    </tbody>
  );
}

export function MetricTableRow<TRow extends MetricTableRow>({
  row,
}: {
  row: Row<TRow>;
}) {
  const { hoveredRowId, setHoveredRowId } = useMetricTableContext();
  const rowId = getRowIdentifier(row);
  const isHovered = hoveredRowId === rowId;
  const handleMouseEnter = () => {
    setHoveredRowId(isHovered ? null : rowId);
  };
  const handleMouseLeave = () => {
    setHoveredRowId(isHovered ? null : null);
  };

  return (
    <tr
      key={row.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "transition-colors",
        row.getIsSelected() || isHovered
          ? "bg-blue-50"
          : row.index % 2 === 0
            ? "bg-white"
            : "bg-gray-50/50"
      )}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={cn(
            "px-6 py-4 whitespace-nowrap",
            (cell.column.columnDef.meta as { className?: string })?.className
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

function getRowIdentifier<TRow extends MetricTableRow>(row: Row<TRow>): string {
  if ("inseeCode" in row.original) {
    return row.original.inseeCode;
  }
  if ("section" in row.original) {
    return row.original.section;
  }
  return row.id;
}
