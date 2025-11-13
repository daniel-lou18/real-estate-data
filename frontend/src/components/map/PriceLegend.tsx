import { MAP_BUCKET_COLORS } from "./colors";

type PriceLegendProps = {
  /** Minimum value (used to calculate thresholds and left label) */
  min: number;
  /** Maximum value (used to calculate thresholds and right label) */
  max: number;
  /** Tailwind background color classes for each segment. Length should equal "segments" */
  colors?: string[];
  /** Number of color segments */
  segments?: number;
  /** Render the "< minLabel" and "> maxLabel" extremes? */
  showExtremes?: boolean;
  /** Formatter for labels (for currency, thousands separator, etc) */
  format?: (value: number) => string;
  /** Optional className to pass to the outer container */
  className?: string;
  /** If true, segments have a small border-radius and spacing for the pill effect */
  rounded?: boolean;
  /** Small/medium/large sizing shortcut */
  size?: "sm" | "md" | "lg";
};

export default function PriceLegend({
  min,
  max,
  colors = MAP_BUCKET_COLORS,
  segments = 10,
  showExtremes = true,
  format = (v: number) => `${Math.round(v).toLocaleString()} €`,
  className = "",
  rounded = true,
  size = "md",
}: PriceLegendProps) {
  // Guardrails
  const seg = Math.max(1, Math.floor(segments));
  // If user provided a color array of different length, adjust it.
  const palette =
    colors.length >= seg ? colors.slice(0, seg) : expandColors(colors, seg);

  // Compute thresholds (we'll compute segment boundaries linearly)
  const thresholds = new Array(seg + 1)
    .fill(0)
    .map((_, i) => min + (i / seg) * (max - min));

  // sizes
  const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3";
  const labelTextClass =
    size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-[0.75rem]";

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden={false}>
      {showExtremes && (
        <div className={`flex-shrink-0 ${labelTextClass}`} aria-hidden>
          {`< ${format(min)}`}
        </div>
      )}

      <div
        className={`flex-1 rounded-md p-1 bg-white/40 shadow-inner flex items-center ${heightClass}`}
        role="img"
        aria-label={`Legend showing ${seg} color ranges from ${format(min)} to ${format(max)}`}
      >
        <div
          className={`flex w-full h-full overflow-hidden ${rounded ? "rounded-full" : ""} items-stretch`}
        >
          {palette.map((bgClass, i) => {
            const key = `seg-${i}`;
            // Inline style for equal widths
            return (
              <div
                key={key}
                className={`flex-1 ${bgClass} ${i === 0 ? "rounded-l-full" : ""} ${i === palette.length - 1 ? "rounded-r-full" : ""}`}
                title={`${format(Math.round(thresholds[i]))} - ${format(Math.round(thresholds[i + 1]))}`}
                style={{ minWidth: 0 }}
              />
            );
          })}
        </div>
      </div>

      {showExtremes && (
        <div className={`flex-shrink-0 ${labelTextClass}`} aria-hidden>
          {`> ${format(max)}`}
        </div>
      )}
    </div>
  );
}

/**
 * Expand a short color array into a target length by interpolating through it.
 * We do a simple repeat / blend strategy by cycling provided classes and using
 * the provided classes if not enough. Since Tailwind classes are discrete we
 * mostly repeat nearest ones. This function ensures the component doesn't
 * crash if the user provides fewer colors than segments.
 */
function expandColors(colors: string[], target: number) {
  if (!colors || colors.length === 0) return MAP_BUCKET_COLORS.slice(0, target);
  const out: string[] = [];
  for (let i = 0; i < target; i++) {
    // pick from existing colors cycling through
    out.push(colors[Math.floor((i / target) * colors.length)]);
  }
  return out;
}

/**
 * Example usage component (named export). This is small demo wiring that shows
 * how you might use PriceLegend with realistic values similar to the reference image.
 */
export function PriceLegendExample() {
  const min = 7800;
  const max = 10950;
  return (
    <div className="p-4 max-w-xl">
      <PriceLegend
        min={min}
        max={max}
        segments={10}
        rounded
        size="lg"
        className="bg-transparent"
        format={(v) => `${Math.round(v).toLocaleString()} €`}
      />
    </div>
  );
}
