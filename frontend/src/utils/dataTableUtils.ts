import { type FilterFn } from "@tanstack/react-table";

export const formatFilterValue = (filterValue: any): string => {
  if (typeof filterValue === "object" && filterValue.type) {
    const { type, value, secondValue } = filterValue;
    switch (type) {
      case "contains":
        return `contains "${value}"`;
      case "startsWith":
        return `starts with "${value}"`;
      case "endsWith":
        return `ends with "${value}"`;
      case "equals":
        return `= ${value}`;
      case "greaterThan":
        return `> ${value}`;
      case "lessThan":
        return `< ${value}`;
      case "greaterThanOrEqual":
        return `≥ ${value}`;
      case "lessThanOrEqual":
        return `≤ ${value}`;
      case "between":
        return `${value} - ${secondValue}`;
      default:
        return `= ${value}`;
    }
  }
  return Array.isArray(filterValue)
    ? filterValue.join(", ")
    : String(filterValue);
};

// Text-based filtering for string columns (city, province)
export const textSearch: FilterFn<any> = (row, columnId, filterValue) => {
  if (typeof filterValue === "object" && filterValue.type) {
    const cellValue = row.getValue(columnId) as string;
    switch (filterValue.type) {
      case "contains":
        return cellValue
          ?.toLowerCase()
          .includes(filterValue.value?.toLowerCase() || "");
      case "startsWith":
        return cellValue
          ?.toLowerCase()
          .startsWith(filterValue.value?.toLowerCase() || "");
      case "endsWith":
        return cellValue
          ?.toLowerCase()
          .endsWith(filterValue.value?.toLowerCase() || "");
      default:
        return cellValue === filterValue.value;
    }
  }
  return row.getValue(columnId) === filterValue;
};

// Numeric comparison filtering for pure numeric columns (price)
export const numericComparison: FilterFn<any> = (
  row,
  columnId,
  filterValue
) => {
  if (typeof filterValue === "object" && filterValue.type) {
    const cellValue = row.getValue(columnId) as number;
    switch (filterValue.type) {
      case "greaterThan":
        return cellValue > filterValue.value;
      case "lessThan":
        return cellValue < filterValue.value;
      case "greaterThanOrEqual":
        return cellValue >= filterValue.value;
      case "lessThanOrEqual":
        return cellValue <= filterValue.value;
      case "between":
        const [min, max] = filterValue.value as [number, number];
        return cellValue >= min && cellValue <= max;
      default:
        return cellValue === filterValue.value;
    }
  }
  return row.getValue(columnId) === filterValue;
};

// Hybrid filtering for numeric fields that support text operations (postal codes)
export const numericWithText: FilterFn<any> = (row, columnId, filterValue) => {
  if (typeof filterValue === "object" && filterValue.type) {
    const cellValue = row.getValue(columnId) as number;
    switch (filterValue.type) {
      case "contains":
        return cellValue
          .toString()
          .includes(filterValue.value?.toString() || "");
      case "startsWith":
        return cellValue
          .toString()
          .startsWith(filterValue.value?.toString() || "");
      case "endsWith":
        return cellValue
          .toString()
          .endsWith(filterValue.value?.toString() || "");
      case "greaterThan":
        return cellValue > filterValue.value;
      case "lessThan":
        return cellValue < filterValue.value;
      case "greaterThanOrEqual":
        return cellValue >= filterValue.value;
      case "lessThanOrEqual":
        return cellValue <= filterValue.value;
      case "between":
        const [min, max] = filterValue.value as [number, number];
        return cellValue >= min && cellValue <= max;
      default:
        return cellValue === filterValue.value;
    }
  }
  return row.getValue(columnId) === filterValue;
};
