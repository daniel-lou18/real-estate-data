import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { mapService } from "@/services/api";
import type {
  MapFeatureCollection,
  MapFeatureParams,
  MapLegendParams,
  MapLegendResponse,
} from "@/types";
import { GC_TIME, STALE_TIME } from "@/hooks/data/constants";
import { useFilters } from "./useFilters";

export const mapQueryKeys = {
  all: ["map"] as const,
  features: (params: MapFeatureParams) =>
    [...mapQueryKeys.all, "features", createParamsKey(params)] as const,
  legend: (params: MapLegendParams) =>
    [...mapQueryKeys.all, "legend", createParamsKey(params)] as const,
} as const;

type MapFeaturesQueryKey = ReturnType<typeof mapQueryKeys.features>;
type MapLegendQueryKey = ReturnType<typeof mapQueryKeys.legend>;

type MapFeaturesQueryOptions = Omit<
  UseQueryOptions<
    MapFeatureCollection,
    Error,
    MapFeatureCollection,
    MapFeaturesQueryKey
  >,
  "queryKey" | "queryFn"
>;

type MapLegendQueryOptions = Omit<
  UseQueryOptions<
    MapLegendResponse,
    Error,
    MapLegendResponse,
    MapLegendQueryKey
  >,
  "queryKey" | "queryFn"
>;

export function useMapFeatureCollection(
  params?: Partial<MapFeatureParams>,
  options?: MapFeaturesQueryOptions
) {
  const { state: filterState } = useFilters();

  const mergedParams = {
    ...filterState,
    ...(params ?? {}),
  } as MapFeatureParams;

  const queryParams = sanitizeFeatureParams(mergedParams);

  return useQuery<
    MapFeatureCollection,
    Error,
    MapFeatureCollection,
    MapFeaturesQueryKey
  >({
    queryKey: mapQueryKeys.features(queryParams),
    queryFn: () => mapService.getFeatures(queryParams),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    ...options,
  });
}

export function useMapLegend(
  params?: Partial<MapLegendParams>,
  options?: MapLegendQueryOptions
) {
  const { state: filterState } = useFilters();

  const mergedParams = {
    ...filterState,
    ...(params ?? {}),
  } as MapLegendParams;

  const queryParams = sanitizeLegendParams(mergedParams);

  return useQuery<
    MapLegendResponse,
    Error,
    MapLegendResponse,
    MapLegendQueryKey
  >({
    queryKey: mapQueryKeys.legend(queryParams),
    queryFn: () => mapService.getLegend(queryParams),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    ...options,
  });
}

function createParamsKey(params: MapFeatureParams | MapLegendParams): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key, value] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(entries);
}

function sanitizeFeatureParams(params: MapFeatureParams): MapFeatureParams {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as MapFeatureParams;
}

function sanitizeLegendParams(params: MapLegendParams): MapLegendParams {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as MapLegendParams;
}
