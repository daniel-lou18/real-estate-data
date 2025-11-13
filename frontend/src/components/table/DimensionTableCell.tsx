import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DimensionTableCellProps = {
  label: ReactNode;
  description?: ReactNode;
  canExpand?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function DimensionTableCell({
  label,
  description,
  canExpand = false,
  isExpanded = false,
  onToggleExpand,
  className = "",
}: DimensionTableCellProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-3 text-sm text-gray-900",
        className
      )}
    >
      {canExpand ? (
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-500/60 rounded-sm"
          aria-label={isExpanded ? "Collapse row" : "Expand row"}
        >
          {isExpanded ? "−" : "+"}
        </button>
      ) : null}
      <div className="flex flex-col">
        <span className="font-medium leading-tight">{label}</span>
        {description ? (
          <span className="text-sm text-gray-500 leading-tight">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
