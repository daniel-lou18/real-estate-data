import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";
import { GC_TIME, STALE_TIME } from "./constants";
import type {
  ApartmentsByInseeYear,
  ApartmentsBySectionYear,
  InseeYearParams,
  SectionYearParams,
} from "@/services/api/types";

export type QueryOptions<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, Error, TData>,
  "queryKey" | "queryFn"
>;

// Query keys for better cache management and invalidation
const removeUndefinedEntries = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).filter(
      ([, value]) => value !== undefined
    )
  ) as Partial<T>;

export const communeQueryKeys = {
  all: ["communes"] as const,
  lists: () => [...communeQueryKeys.all, "list"] as const,
  list: (filters: Partial<InseeYearParams> = {}) =>
    [
      ...communeQueryKeys.lists(),
      { filters: removeUndefinedEntries(filters) },
    ] as const,
  sectionLists: () => [...communeQueryKeys.all, "sections"] as const,
  sectionList: (filters: Partial<SectionYearParams> = {}) =>
    [
      ...communeQueryKeys.sectionLists(),
      { filters: removeUndefinedEntries(filters) },
    ] as const,
} as const;

// Query options for reusability and consistency
const defaultQueryOptions = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

export function useGetAggregates<TData = ApartmentsByInseeYear[]>(
  options?: QueryOptions<ApartmentsByInseeYear[], TData>
) {
  return useQuery<ApartmentsByInseeYear[], Error, TData>({
    queryKey: communeQueryKeys.lists(),
    queryFn: async (): Promise<ApartmentsByInseeYear[]> => {
      // Use analyticsService to get all arrondissements
      const result = await analyticsService.getApartmentsByInseeYear();
      return result;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Hook to get a specific commune by INSEE code
 *
 * @param inseeCode - The INSEE code of the commune
 * @param options - Optional query configuration
 */
export function useGetAggregatesByInseeCode<TData = ApartmentsByInseeYear[]>(
  params: Partial<InseeYearParams> = {},
  options?: QueryOptions<ApartmentsByInseeYear[], TData>
) {
  const filters = removeUndefinedEntries(params);

  return useQuery<ApartmentsByInseeYear[], Error, TData>({
    queryKey: communeQueryKeys.list(filters),
    queryFn: async () => {
      const result = await analyticsService.getApartmentsByInseeYear(filters);
      return result;
    },
    enabled: options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Hook to get commune data by INSEE code and section
 *
 * @param inseeCode - The INSEE code of the commune
 * @param section - The section code
 * @param options - Optional query configuration
 */
export function useGetAggregatesByInseeCodeAndSection<
  TData = ApartmentsBySectionYear[],
>(
  params: Partial<SectionYearParams> = {},
  options?: QueryOptions<ApartmentsBySectionYear[], TData>
) {
  const filters = removeUndefinedEntries(params);

  return useQuery<ApartmentsBySectionYear[], Error, TData>({
    queryKey: communeQueryKeys.sectionList(filters),
    queryFn: async (): Promise<ApartmentsBySectionYear[]> => {
      const result = await analyticsService.getApartmentsBySectionYear(filters);
      return result;
    },
    enabled: options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}
