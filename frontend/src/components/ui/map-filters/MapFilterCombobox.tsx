import { useCallback, useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { FilterState } from "@/hooks/map";

import {
  CLEAR_VALUE,
  useFilterControl,
  useOptionMap,
  type BaseFilterProps,
  type FilterableKeys,
} from "./useFilterControl";

export type MapFilterComboboxProps<K extends FilterableKeys> =
  BaseFilterProps<K> & {
    clearable?: boolean;
    clearLabel?: string;
    emptyState?: string;
    inputPlaceholder?: string;
    buttonClassName?: string;
    contentClassName?: string;
  };

export function MapFilterCombobox<K extends FilterableKeys>({
  filterKey,
  options,
  placeholder = "Select option",
  label,
  disabled = false,
  isLoading = false,
  clearable = false,
  clearLabel = "Clear selection",
  emptyState = "No results found.",
  inputPlaceholder = "Search...",
  className,
  buttonClassName,
  contentClassName,
  onValueChange,
}: MapFilterComboboxProps<K>) {
  const [open, setOpen] = useState(false);

  const { currentValue, applyValue } = useFilterControl(
    filterKey,
    onValueChange
  );
  const valueMap = useOptionMap(options);

  const currentKey =
    currentValue === undefined || currentValue === null
      ? ""
      : String(currentValue);

  const selectedOption =
    currentKey === "" ? undefined : valueMap.get(currentKey);

  const handleSelect = useCallback(
    (selected: string) => {
      if (clearable && selected === CLEAR_VALUE) {
        applyValue(undefined);
        setOpen(false);
        return;
      }

      const option = valueMap.get(selected);
      if (!option) {
        return;
      }

      const nextValue = option.value as FilterState[K];

      if (currentValue === nextValue) {
        if (clearable && currentValue !== undefined) {
          applyValue(undefined);
        }
        setOpen(false);
        return;
      }

      applyValue(nextValue);
      setOpen(false);
    },
    [applyValue, clearable, currentValue, valueMap]
  );

  const displayLabel = selectedOption?.label ?? placeholder;

  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <span className="block text-sm font-medium text-muted-foreground">
          {label}
        </span>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label ?? placeholder}
            className={cn(
              "w-full justify-between",
              !selectedOption && "text-muted-foreground",
              buttonClassName
            )}
            disabled={disabled}
          >
            {displayLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            contentClassName
          )}
        >
          <Command>
            <CommandInput
              placeholder={inputPlaceholder}
              disabled={disabled || isLoading || options.length === 0}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyState}</CommandEmpty>
                  {clearable && (
                    <CommandItem value={CLEAR_VALUE} onSelect={handleSelect}>
                      {clearLabel}
                    </CommandItem>
                  )}
                  <CommandGroup>
                    {options.map((option) => {
                      const optionKey = String(option.value);
                      const isSelected = currentKey === optionKey;

                      return (
                        <CommandItem
                          key={optionKey}
                          value={optionKey}
                          onSelect={handleSelect}
                        >
                          {option.label}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
