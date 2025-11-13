import { cn } from "@/lib/utils";

type DataSourceProps = {
  dataSource?: "chat" | "map" | null;
  lastUpdateTime?: number;
  isProcessing?: boolean;
  onDataSourceToggle?: () => void;
};

export default function DataSource({
  dataSource,
  lastUpdateTime,
  isProcessing,
  onDataSourceToggle,
}: DataSourceProps) {
  return (
    <div className="flex items-center space-x-3">
      {/* Data Source Indicator */}
      {dataSource && (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  dataSource === "chat" ? "bg-blue-500" : "bg-emerald-500"
                )}
              />
              {isProcessing && (
                <div
                  className={cn(
                    "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse",
                    dataSource === "chat" ? "bg-blue-300" : "bg-emerald-300"
                  )}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {dataSource === "chat" ? "Chat Results" : "Map Data"}
              </span>
              {lastUpdateTime && (
                <span className="text-xs text-gray-500">
                  Updated {new Date(lastUpdateTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Data Source Toggle Button */}
          {onDataSourceToggle && (
            <button
              onClick={onDataSourceToggle}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              title={`Switch to ${dataSource === "chat" ? "map data" : "chat data"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-sm font-medium">Processing...</span>
        </div>
      )}
    </div>
  );
}
