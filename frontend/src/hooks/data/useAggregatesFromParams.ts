import { useParams } from "react-router";
import {
  useGetAggregatesByInseeCode,
  useGetAggregatesByInseeCodeAndSection,
} from "./useGetAggregates";
import { useFilters } from "../map";
import type { CommuneTableData, SectionTableData } from "@/types";
import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Custom hook that combines URL parameters with data fetching
 * Automatically determines whether to fetch arrondissement or section data
 * based on the current URL parameters.
 *
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data: aggregates, isLoading, error } = useAggregatesFromParams();
 *
 * // The hook automatically handles:
 * // - /paris-1er-arrondissement-75101 -> fetches arrondissement data
 * // - /paris-1er-arrondissement-75101/section-A -> fetches section data
 * ```
 */

export function useAggregatesFromParams() {
  const { commune, section } = useParams();
  const { state: filterState } = useFilters();

  const inseeCode = commune?.split("-").at(-1);

  // Always call both hooks to avoid conditional hook calls
  const communeQuery: UseQueryResult<CommuneTableData[], Error> =
    useGetAggregatesByInseeCode(
      { inseeCode },
      {
        select: (data) =>
          data.map((item) => ({
            year: item.year,
            inseeCode: item.inseeCode,
            [filterState.field]: item[filterState.field],
            transactions: item.total_sales,
          })),
      }
    );

  const sectionQuery: UseQueryResult<SectionTableData[], Error> =
    useGetAggregatesByInseeCodeAndSection(
      { inseeCode, section },
      {
        select: (data) =>
          data.map((item) => ({
            year: item.year,
            inseeCode: item.inseeCode,
            section: item.section,
            [filterState.field]: item[filterState.field],
            transactions: item.total_sales,
          })),
      }
    );

  return { communeQuery, sectionQuery };
}
