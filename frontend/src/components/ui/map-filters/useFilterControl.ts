import { useCallback, useMemo } from "react";
import { useFilters, type FilterState } from "@/hooks/map";

export type SelectOption<Value extends string | number> = {
  value: Value;
  label: string;
};

export const CLEAR_VALUE = "__clear__";

export type FilterableKeys = "propertyType" | "field" | "year" | "month";

export type FilterOptionValue<K extends FilterableKeys> = Extract<
  FilterState[K],
  string | number
>;

export type BaseFilterProps<K extends FilterableKeys> = {
  filterKey: K;
  options: SelectOption<FilterOptionValue<K>>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onValueChange?: (value: FilterState[K] | undefined) => void;
};

export function useFilterControl<K extends FilterableKeys>(
  filterKey: K,
  onValueChange?: (value: FilterState[K] | undefined) => void
) {
  const {
    state,
    setFilters,
    setLevel,
    setPropertyType,
    setField,
    setYear,
    setMonth,
  } = useFilters();

  const applyValue = useCallback(
    (nextValue: FilterState[K] | undefined) => {
      switch (filterKey) {
        case "propertyType":
          if (nextValue !== undefined) {
            setPropertyType(nextValue as FilterState["propertyType"]);
          }
          break;
        case "field":
          if (nextValue !== undefined) {
            setField(nextValue as FilterState["field"]);
          }
          break;
        case "year":
          if (nextValue !== undefined) {
            setYear(Number(nextValue));
          }
          break;
        case "month":
          setMonth(nextValue as FilterState["month"]);
          break;
        default:
          setFilters({ [filterKey]: nextValue } as Partial<FilterState>);
      }

      onValueChange?.(nextValue);
    },
    [
      filterKey,
      onValueChange,
      setField,
      setFilters,
      setLevel,
      setMonth,
      setPropertyType,
      setYear,
    ]
  );

  return {
    currentValue: state[filterKey],
    applyValue,
  };
}

export function useOptionMap<K extends FilterableKeys>(
  options: SelectOption<FilterOptionValue<K>>[]
) {
  return useMemo(() => {
    const map = new Map<string, SelectOption<FilterOptionValue<K>>>();

    options.forEach((option) => {
      map.set(String(option.value), option);
    });

    return map;
  }, [options]);
}
