import { useCallback } from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FilterState } from "@/hooks/map";

import {
  CLEAR_VALUE,
  useFilterControl,
  useOptionMap,
  type BaseFilterProps,
  type FilterableKeys,
} from "./useFilterControl";

export type MapFilterSelectProps<K extends FilterableKeys> =
  BaseFilterProps<K> & {
    clearable?: boolean;
    clearLabel?: string;
    emptyState?: string;
    triggerClassName?: string;
    contentClassName?: string;
    loadingLabel?: string;
    size?: "sm" | "default";
  };

export function MapFilterSelect<K extends FilterableKeys>({
  filterKey,
  options,
  placeholder = "Select option",
  label,
  disabled = false,
  isLoading = false,
  clearable = false,
  clearLabel = "Clear selection",
  emptyState = "No options available.",
  loadingLabel = "Loading...",
  className,
  triggerClassName,
  contentClassName,
  size = "default",
  onValueChange,
}: MapFilterSelectProps<K>) {
  const { currentValue, applyValue } = useFilterControl(
    filterKey,
    onValueChange
  );
  const valueMap = useOptionMap(options);

  const currentKey =
    currentValue === undefined || currentValue === null
      ? ""
      : String(currentValue);

  const selectValue = currentKey === "" ? undefined : currentKey;

  const handleChange = useCallback(
    (next: string) => {
      if (clearable && next === CLEAR_VALUE) {
        applyValue(undefined);
        return;
      }

      const option = valueMap.get(next);
      if (!option) {
        return;
      }

      applyValue(option.value as FilterState[K]);
    },
    [applyValue, clearable, valueMap]
  );

  const isDisabled = disabled || (options.length === 0 && !isLoading);

  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <span className="block text-sm font-medium text-muted-foreground">
          {label}
        </span>
      ) : null}
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isDisabled || isLoading}
      >
        <SelectTrigger
          size={size}
          className={cn("w-full justify-between", triggerClassName)}
          aria-label={label ?? placeholder}
        >
          <SelectValue placeholder={isLoading ? loadingLabel : placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              {loadingLabel}
            </SelectItem>
          ) : options.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              {emptyState}
            </SelectItem>
          ) : (
            <>
              {clearable && (
                <SelectItem value={CLEAR_VALUE}>{clearLabel}</SelectItem>
              )}
              {options.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
