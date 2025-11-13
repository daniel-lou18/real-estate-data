import type { UseTableStateReturn } from "@/hooks/table/useTableState";
import { cn } from "@/lib/utils";

type ActionButtonsProps = {
  tableState: UseTableStateReturn;
};

export default function ActionButtons({ tableState }: ActionButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Toggle Group by Province */}
      <button
        onClick={() => {
          if (tableState.grouping.length > 0) {
            // Clear grouping
            tableState.setGrouping([]);
            tableState.setExpanded({});
          } else {
            // Apply grouping
            tableState.setGrouping(["inseeCode"]);
            tableState.setExpanded(true);
          }
        }}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
          tableState.grouping.length > 0
            ? "bg-indigo-600 text-white focus:ring-indigo-500 shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400"
        )}
        title={
          tableState.grouping.length > 0
            ? "Clear grouping"
            : "Group by insee code"
        }
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 12a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zM9 16a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Clear Filters */}
      <button
        onClick={() => tableState.setColumnFilters([])}
        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        title="Clear filters"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Clear Sort */}
      <button
        onClick={() => tableState.setSorting([])}
        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        title="Clear sorting"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 000 2h11a1 1 0 100-2H3zM3 8a1 1 0 000 2h7a1 1 0 100-2H3zM3 12a1 1 0 100 2h4a1 1 0 100-2H3z" />
        </svg>
      </button>

      {/* Clear Selection */}
      <button
        onClick={() => tableState.setRowSelection({})}
        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        title="Clear selection"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
