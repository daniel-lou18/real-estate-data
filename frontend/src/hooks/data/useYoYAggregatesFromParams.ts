import { useParams } from "react-router";
import {
  useGetAggregatesYoYByInseeCode,
  useGetAggregatesYoYByInseeCodeAndSection,
} from "./useGetAggregatesYoY";
import { useFilters } from "../map";
import type {
  CommuneYoYTableData,
  SectionYoYTableData,
} from "@/components/table/types";
import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Custom hook that combines URL parameters with YoY data fetching
 * Automatically determines whether to fetch arrondissement or section data
 * based on the current URL parameters.
 *
 * @returns Query results with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { communeQuery, sectionQuery } = useYoYAggregatesFromParams();
 *
 * // The hook automatically handles:
 * // - /paris-1er-arrondissement-75101 -> fetches arrondissement YoY data
 * // - /paris-1er-arrondissement-75101/section-A -> fetches section YoY data
 * ```
 */
export function useYoYAggregatesFromParams() {
  const { commune, section } = useParams();
  const { state: filterState } = useFilters();

  const inseeCode = commune?.split("-").at(-1);

  // Always call both hooks to avoid conditional hook calls
  const communeQuery: UseQueryResult<CommuneYoYTableData[], Error> =
    useGetAggregatesYoYByInseeCode(
      { inseeCode },
      {
        select: (data) =>
          data.map((item) => ({
            year: item.year,
            inseeCode: item.inseeCode,
            base_year: item.base_year,
            transactions: item.total_sales.current ?? 0,
            [filterState.field]: (item as Record<string, unknown>)[
              filterState.field
            ],
          })),
      }
    );

  const sectionQuery: UseQueryResult<SectionYoYTableData[], Error> =
    useGetAggregatesYoYByInseeCodeAndSection(
      { inseeCode, section },
      {
        select: (data) =>
          data.map((item) => ({
            year: item.year,
            inseeCode: item.inseeCode,
            base_year: item.base_year,
            section: item.section,
            transactions: item.total_sales.current ?? 0,
            [filterState.field]: (item as Record<string, unknown>)[
              filterState.field
            ],
          })),
      }
    );

  return { communeQuery, sectionQuery };
}
