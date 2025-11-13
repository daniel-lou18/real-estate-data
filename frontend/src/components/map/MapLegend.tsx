import { useState } from "react";
import PriceLegend from "./PriceLegend";
import { useMapLegend, useFilters } from "@/hooks/map";
import type { MapLegendBucket } from "@/types";
import { MAP_BUCKET_COLORS } from "./colors";
import { formatMetricValue, humanizeMetricName } from "./mapLegendUtils";

type MapLegendProps = {
  selectedArrondissementIds: string[];
};

export default function MapLegend({
  selectedArrondissementIds,
}: MapLegendProps) {
  const { state: filters } = useFilters();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    data: legend,
    isLoading,
    error,
  } = useMapLegend({
    inseeCodes: filters.inseeCodes,
  });

  if (isLoading) {
    return (
      <div className="absolute top-5 left-5 z-[1000] bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-md text-sm text-gray-600">
        Chargement de la légende…
      </div>
    );
  }

  if (error || !legend || legend.buckets.length === 0) {
    return null;
  }

  const minValue = coalesceNumber(legend.stats.min, legend.buckets[0]?.min, 0);
  const maxValue = coalesceNumber(
    legend.stats.max,
    legend.buckets[legend.buckets.length - 1]?.max,
    minValue
  );

  if (minValue === null || maxValue === null || maxValue === minValue) {
    return null;
  }

  const title = buildLegendTitle(
    filters.level,
    legend.field,
    selectedArrondissementIds
  );

  return (
    <div className="absolute top-5 left-5 w-[420px] z-[1000] bg-white/95 p-4 rounded-lg shadow-lg backdrop-blur-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-label={
            isExpanded ? "Réduire les détails" : "Afficher les détails"
          }
          aria-expanded={isExpanded}
          title={isExpanded ? "Masquer les détails" : "Afficher les détails"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
        >
          <ChevronIcon isOpen={isExpanded} />
        </button>
      </div>

      <PriceLegend
        min={minValue}
        max={maxValue}
        segments={legend.buckets.length}
        rounded
        size="lg"
        format={(value) => formatMetricValue(value)}
      />

      {isExpanded && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
          {legend.buckets.map((bucket, index) => (
            <LegendBucketRow
              key={`${bucket.label}-${index}`}
              bucket={bucket}
              index={index}
            />
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
        <StatItem label="Min" value={legend.stats.min} />
        <StatItem label="Median" value={legend.stats.median} />
        <StatItem label="Max" value={legend.stats.max} />
      </div>
    </div>
  );
}

function LegendBucketRow({
  bucket,
  index,
}: {
  bucket: MapLegendBucket;
  index: number;
}) {
  const colorClass =
    MAP_BUCKET_COLORS[index] ?? MAP_BUCKET_COLORS[MAP_BUCKET_COLORS.length - 1];

  return (
    <div className="flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-3 w-3 rounded-full ${colorClass} shadow-sm`}
        />
        <span className="font-medium text-gray-700">{bucket.label}</span>
      </div>
      {/* <span className="tabular-nums text-gray-500">
        {typeof bucket.count === "number" ? bucket.count.toLocaleString() : "—"}
      </span> */}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col">
      <span className="uppercase tracking-wide text-[0.65rem] text-gray-400">
        {label}
      </span>
      <span className="font-medium text-gray-700">
        {value !== null && value !== undefined ? formatMetricValue(value) : "—"}
      </span>
    </div>
  );
}

function buildLegendTitle(
  level: string,
  field: string,
  selectedArrondissementIds: string[]
): string {
  const hasSelection = selectedArrondissementIds.length > 0;
  const selectionLabel = hasSelection
    ? `Sections (${selectedArrondissementIds.join(", ")})`
    : "Sections";
  const levelLabel = level === "section" ? selectionLabel : "Communes";

  return `${humanizeMetricName(field)} • ${levelLabel}`;
}

function coalesceNumber(
  ...values: Array<number | null | undefined>
): number | null {
  for (const value of values) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
  }
  return null;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.5 7.5L10 12.5L14.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
