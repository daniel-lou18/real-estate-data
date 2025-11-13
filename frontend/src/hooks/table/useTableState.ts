import { useState } from "react";
import {
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type GroupingState,
  type ExpandedState,
  type OnChangeFn,
} from "@tanstack/react-table";

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  rowSelection: RowSelectionState;
  grouping: GroupingState;
  expanded: ExpandedState;
}

export interface UseTableStateReturn extends TableState {
  setSorting: OnChangeFn<SortingState>;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setGlobalFilter: (filter: string) => void;
  setRowSelection: OnChangeFn<RowSelectionState>;
  setGrouping: OnChangeFn<GroupingState>;
  setExpanded: OnChangeFn<ExpandedState>;
  resetFilters: () => void;
  resetSelection: () => void;
  resetGrouping: () => void;
  resetAll: () => void;
}

const initialState: TableState = {
  sorting: [],
  columnFilters: [],
  globalFilter: "",
  rowSelection: {},
  grouping: [],
  expanded: {},
};

/**
 * Custom hook to manage all table state in one place
 * This centralizes sorting, filtering, and selection state
 */
export function useTableState(): UseTableStateReturn {
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState.columnFilters
  );
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialState.rowSelection
  );
  const [grouping, setGrouping] = useState<GroupingState>(
    initialState.grouping
  );
  const [expanded, setExpanded] = useState<ExpandedState>(
    initialState.expanded
  );

  const resetFilters = () => {
    setColumnFilters(initialState.columnFilters);
    setGlobalFilter(initialState.globalFilter);
  };

  const resetSelection = () => {
    setRowSelection(initialState.rowSelection);
  };

  const resetGrouping = () => {
    setGrouping(initialState.grouping);
    setExpanded(initialState.expanded);
  };

  const resetAll = () => {
    setSorting(initialState.sorting);
    resetFilters();
    resetSelection();
    resetGrouping();
  };

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    grouping,
    setGrouping,
    expanded,
    setExpanded,
    resetFilters,
    resetSelection,
    resetGrouping,
    resetAll,
  };
}

// function logState(state: TableState) {
//   console.log(`
//     Sorting: ${state.sorting.map((s) => s.id).join(", ")}
//     Column Filters: ${state.columnFilters.map((c) => c.id).join(", ")}
//     Global Filter: ${state.globalFilter}
//     Row Selection: ${Object.keys(state.rowSelection).join(", ")}
//     Grouping: ${state.grouping.join(", ")}
//     Expanded: ${Object.keys(state.expanded).join(", ")}
//     `);
// }
