import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "@/services/api";
import type {
  YearDeltaParams,
  YearlyDeltasByInsee,
  YearlyDeltasBySection,
} from "@/services/api/types";

import { GC_TIME, STALE_TIME } from "./constants";
import type { QueryOptions } from "./useGetAggregates";

const removeUndefinedEntries = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).filter(
      ([, value]) => value !== undefined
    )
  ) as Partial<T>;

const defaultQueryOptions = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

export const communeYoYQueryKeys = {
  all: ["communes", "yoy"] as const,
  lists: () => [...communeYoYQueryKeys.all, "list"] as const,
  list: (filters: Partial<YearDeltaParams> = {}) =>
    [...communeYoYQueryKeys.lists(), { filters }] as const,
  sectionLists: () => [...communeYoYQueryKeys.all, "sections"] as const,
  sectionList: (filters: Partial<YearDeltaParams> = {}) =>
    [...communeYoYQueryKeys.sectionLists(), { filters }] as const,
} as const;

export function useGetAggregatesYoY<TData = YearlyDeltasByInsee[]>(
  options?: QueryOptions<YearlyDeltasByInsee[], TData>
) {
  return useQuery<YearlyDeltasByInsee[], Error, TData>({
    queryKey: communeYoYQueryKeys.lists(),
    queryFn: async () => {
      const result = await analyticsService.getApartmentsByInseeYoY();
      return result;
    },
    enabled: options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}

export function useGetAggregatesYoYByInseeCode<TData = YearlyDeltasByInsee[]>(
  params: Partial<YearDeltaParams> = {},
  options?: QueryOptions<YearlyDeltasByInsee[], TData>
) {
  const filters = removeUndefinedEntries(params);

  return useQuery<YearlyDeltasByInsee[], Error, TData>({
    queryKey: communeYoYQueryKeys.list(filters),
    queryFn: async () => {
      const result = await analyticsService.getApartmentsByInseeYoY(filters);
      return result;
    },
    enabled: options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}

export function useGetAggregatesYoYByInseeCodeAndSection<
  TData = YearlyDeltasBySection[],
>(
  params: Partial<YearDeltaParams> = {},
  options?: QueryOptions<YearlyDeltasBySection[], TData>
) {
  const filters = removeUndefinedEntries(params);

  return useQuery<YearlyDeltasBySection[], Error, TData>({
    queryKey: communeYoYQueryKeys.sectionList(filters),
    queryFn: async () => {
      const result = await analyticsService.getApartmentsBySectionYoY(filters);
      return result;
    },
    enabled: options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}
