import { useTableState } from "@/hooks/table/useTableState";
import ParisMap from "@/components/map/Map";
import { useState } from "react";
import TableHeader from "@/components/table/TableHeader";
import { MessageInput } from "./chat/MessageInput";
import { useDataOrchestrator } from "@/hooks/data/useDataOrchestrator";
import ActionButtons from "./table/ActionButtons";
import DataSource from "./table/DataSource";
import Topbar from "./topbar";
import { useFilters } from "@/hooks/map";
import { SectionMetricTable, CommuneMetricTable } from "./table";
import { useYoYAggregatesFromParams } from "@/hooks/data/useYoYAggregatesFromParams";

function App() {
  const tableState = useTableState();
  const {
    state: { field, level },
  } = useFilters();
  const {
    dataSource,
    isProcessing,
    handleSendMessage,
    lastUpdateTime,
    handleDataSourceToggle,
    handleMapClick,
  } = useDataOrchestrator();

  const {
    data: communeData,
    isLoading: communeLoading,
    isError: isCommuneError,
    error: communeError,
  } = useYoYAggregatesFromParams().communeQuery;

  const {
    data: sectionData,
    isLoading: sectionLoading,
    isError: isSectionError,
    error: sectionError,
  } = useYoYAggregatesFromParams().sectionQuery;

  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  // Create the table instance to share between DataTable and ChatInterface
  // const table = useReactTable({
  //   data,
  //   columns: createColumnsFromData(data),
  //   getCoreRowModel: getCoreRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getGroupedRowModel: getGroupedRowModel(),
  //   getExpandedRowModel: getExpandedRowModel(),
  //   enableRowSelection: true,
  //   enableGrouping: true,
  //   state: {
  //     sorting: tableState.sorting,
  //     columnFilters: tableState.columnFilters,
  //     rowSelection: tableState.rowSelection,
  //     grouping: tableState.grouping,
  //     expanded: tableState.expanded,
  //   },
  //   onSortingChange: tableState.setSorting,
  //   onColumnFiltersChange: tableState.setColumnFilters,
  //   onRowSelectionChange: tableState.setRowSelection,
  //   onGroupingChange: tableState.setGrouping,
  //   onExpandedChange: tableState.setExpanded,
  //   filterFns: {
  //     textSearch,
  //     numericComparison,
  //     numericWithText,
  //   },
  // });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Topbar />
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          <div className="col-span-7 bg-white shadow-lg rounded-lg overflow-hidden">
            <ParisMap
              onMapClick={handleMapClick}
              hoveredFeatureId={hoveredFeatureId}
              setHoveredFeatureId={setHoveredFeatureId}
            />
          </div>

          <div className="col-span-5 bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
            <TableHeader>
              <DataSource
                dataSource={dataSource}
                lastUpdateTime={lastUpdateTime}
                isProcessing={isProcessing}
                onDataSourceToggle={handleDataSourceToggle}
              />
              <ActionButtons tableState={tableState} />
            </TableHeader>
            <div className="flex-1 overflow-auto">
              {level === "commune" ? (
                <CommuneMetricTable
                  metric={field}
                  data={communeData ?? []}
                  isLoading={communeLoading}
                  isError={isCommuneError}
                  error={communeError}
                  hoveredRowId={hoveredFeatureId}
                  setHoveredRowId={setHoveredFeatureId}
                />
              ) : (
                <SectionMetricTable
                  metric={field}
                  data={sectionData ?? []}
                  isLoading={sectionLoading}
                  isError={isSectionError}
                  error={sectionError}
                  hoveredRowId={hoveredFeatureId}
                  setHoveredRowId={setHoveredFeatureId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Input Bar at the bottom with sticky and higher z-index */}
        <div className="sticky bottom-0 z-50 bg-gray-50 pt-4">
          <MessageInput
            onSubmit={handleSendMessage}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
