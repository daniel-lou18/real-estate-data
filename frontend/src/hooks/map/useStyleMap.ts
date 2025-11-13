import { useMemo } from "react";

import { useMapLegend } from "./useMapData";
import { MAP_BUCKET_COLOR_HEX } from "@/components/map/colors";
import type { MapLegendResponse } from "@/types";
import type { ExpressionSpecification } from "maplibre-gl";
import { useFilters } from "./useFilters";

/**
 * Custom hook for MapLibre dynamic styling based on backend legend data
 *
 */
export function useStyleMap() {
  const { state: filterState } = useFilters();

  // Fetch legends for commune and section levels
  const communeLegend = useMapLegend({
    level: "commune",
    year: filterState.year,
  });
  const sectionLegend = useMapLegend({
    level: "section",
    year: filterState.year,
    inseeCodes: filterState.inseeCodes,
  });

  const arrondissementFillColor = useMemo(
    () => buildColorExpression(communeLegend.data, "#e5e7eb"),
    [communeLegend.data]
  );

  const sectionFillColor = useMemo(
    () => buildColorExpression(sectionLegend.data, "#bfdbfe"),
    [sectionLegend.data]
  );

  const arrondissementFillOpacity = useMemo(() => buildOpacityExpression(), []);

  const sectionFillOpacity = useMemo(() => buildOpacityExpression(), []);

  return {
    isLoading: communeLegend.isLoading || sectionLegend.isLoading,
    error: communeLegend.error || sectionLegend.error,
    arrondissementFillColor,
    arrondissementFillOpacity,
    sectionFillColor,
    sectionFillOpacity,
  };
}

function buildColorExpression(
  legend: MapLegendResponse | undefined,
  fallbackColor: string
): ExpressionSpecification | string {
  if (!legend || !legend.buckets || legend.buckets.length === 0) {
    return fallbackColor;
  }

  const palette = MAP_BUCKET_COLOR_HEX.slice(0, legend.buckets.length);
  const thresholds = legend.breaks;

  const stepExpression: any[] = ["step", ["get", "metricValue"], palette[0]];

  thresholds.forEach((threshold, index) => {
    const color = palette[index + 1] ?? palette[palette.length - 1];
    stepExpression.push(threshold);
    stepExpression.push(color);
  });

  const expression: any[] = [
    "case",
    [
      "any",
      ["==", ["get", "metricValue"], null],
      ["!", ["has", "metricValue"]],
    ],
    fallbackColor,
    stepExpression,
  ];

  return expression as ExpressionSpecification;
}

function buildOpacityExpression(): ExpressionSpecification {
  return [
    "case",
    [
      "any",
      ["==", ["get", "metricValue"], null],
      ["!", ["has", "metricValue"]],
    ],
    0.2,
    0.7,
  ] as unknown as ExpressionSpecification;
}
