import { METRIC_CATALOG } from "@/constants/catalog";
import type { MetricField } from "@/types";
import { cn } from "@/lib/utils";

export function PercentChangeCell({
  value,
  alignment = "end",
  className = "",
}: {
  value: number | null | undefined;
  alignment?: "start" | "end";
  className?: string;
}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="text-gray-400">—</span>;
  }

  const direction = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  const icon =
    direction === "positive" ? "↗" : direction === "negative" ? "↘" : "→";
  const sign =
    direction === "positive" ? "+" : direction === "negative" ? "−" : "±";
  const colorClass =
    direction === "positive"
      ? "text-emerald-600"
      : direction === "negative"
        ? "text-rose-600"
        : "text-gray-500";
  const formatted = Math.abs(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const alignmentClass =
    alignment === "start" ? "justify-start" : "justify-end";

  return (
    <span
      className={cn(
        "inline-flex items-center",
        alignmentClass,
        "space-x-1 font-medium",
        className,
        colorClass
      )}
    >
      <span aria-hidden>{icon}</span>
      <span>
        {sign}
        {formatted}%
      </span>
    </span>
  );
}

export function MetricValueCell({
  value,
  metric,
  alignment = "end",
  className = "",
}: {
  value: number | null | undefined;
  metric: MetricField;
  alignment?: "start" | "end";
  className?: string;
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className="text-gray-400">—</span>;
  }

  const digits = METRIC_CATALOG[metric]?.digits;
  const minimumFractionDigits = digits?.minimum ?? 0;
  const maximumFractionDigits = digits?.maximum ?? minimumFractionDigits;

  const formatted = value.toLocaleString("fr-FR", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const unit = METRIC_CATALOG[metric]?.unit;
  const alignmentClass =
    alignment === "start" ? "justify-start" : "justify-end";

  return (
    <span
      className={cn(
        "inline-flex items-center text-sm",
        alignmentClass,
        className
      )}
    >
      {formatted}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}

export function AbsoluteChangeCell({
  value,
  unit,
  alignment = "end",
  minimumFractionDigits = 0,
  maximumFractionDigits,
}: {
  value: number | null | undefined;
  unit?: string;
  alignment?: "start" | "end";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="text-gray-400">—</span>;
  }

  const direction = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  const sign =
    direction === "positive" ? "+" : direction === "negative" ? "−" : "±";
  const colorClass =
    direction === "positive"
      ? "text-emerald-600"
      : direction === "negative"
        ? "text-rose-600"
        : "text-gray-500";
  const formatter = {
    minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits ?? minimumFractionDigits,
  } satisfies Intl.NumberFormatOptions;
  const formattedValue = Math.abs(value).toLocaleString("fr-FR", formatter);
  const alignmentClass =
    alignment === "start" ? "justify-start" : "justify-end";

  return (
    <span
      className={cn(
        "inline-flex items-center",
        alignmentClass,
        "space-x-1 text-sm font-medium",
        colorClass
      )}
    >
      <span>
        {sign}
        {formattedValue}
        {unit ? ` ${unit}` : ""}
      </span>
    </span>
  );
}

export function CountCell({
  value,
  alignment = "end",
  className = "",
}: {
  value: number | null | undefined;
  alignment?: "start" | "end";
  className?: string;
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className="text-gray-400">—</span>;
  }

  const formatted = value.toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  });
  const alignmentClass =
    alignment === "start" ? "justify-start" : "justify-end";

  return (
    <span
      className={cn(
        "inline-flex items-center text-sm",
        alignmentClass,
        className
      )}
    >
      {formatted}
    </span>
  );
}

export function SparklineCell({
  values,
  alignment = "center",
  className = "",
  width = 96,
  height = 32,
  padding = 2,
  color,
}: {
  values: Array<number | null | undefined>;
  alignment?: "start" | "center" | "end";
  className?: string;
  width?: number;
  height?: number;
  padding?: number;
  color?: string;
}) {
  const numericValues = values.filter(
    (value): value is number =>
      value !== null && value !== undefined && Number.isFinite(value)
  );

  if (numericValues.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  const firstValue = numericValues[0];
  const lastValue = numericValues[numericValues.length - 1];
  const trend =
    lastValue > firstValue ? "up" : lastValue < firstValue ? "down" : "flat";

  const strokeClass =
    color ??
    (trend === "up"
      ? "text-emerald-500"
      : trend === "down"
        ? "text-rose-500"
        : "text-slate-400");

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min || 1;
  const innerWidth = Math.max(width - padding * 2, 1);
  const innerHeight = Math.max(height - padding * 2, 1);

  const coordinates = numericValues.map((value, index) => {
    const denominator = Math.max(numericValues.length - 1, 1);
    const x = padding + (index / denominator) * innerWidth;
    const normalized = numericValues.length === 1 ? 0.5 : (value - min) / range;
    const y = padding + (1 - normalized) * innerHeight;
    return { x, y };
  });

  const linePath =
    coordinates.length === 1
      ? `M ${coordinates[0].x.toFixed(2)} ${coordinates[0].y.toFixed(2)}`
      : coordinates
          .map((point, index) => {
            const command = index === 0 ? "M" : "L";
            return `${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
          })
          .join(" ");

  const areaPath =
    coordinates.length > 1
      ? `${linePath} L ${coordinates[coordinates.length - 1].x.toFixed(
          2
        )} ${height - padding} L ${coordinates[0].x.toFixed(2)} ${
          height - padding
        } Z`
      : null;

  const alignmentClass =
    alignment === "start"
      ? "justify-start"
      : alignment === "end"
        ? "justify-end"
        : "justify-center";

  return (
    <span
      className={cn("inline-flex", alignmentClass, className)}
      aria-label="Trend sparkline"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={strokeClass}
      >
        {areaPath ? (
          <path
            d={areaPath}
            fill="currentColor"
            fillOpacity={0.12}
            stroke="none"
          />
        ) : null}
        {coordinates.length === 1 ? (
          <circle
            cx={coordinates[0].x}
            cy={coordinates[0].y}
            r={2}
            fill="currentColor"
          />
        ) : (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  );
}
