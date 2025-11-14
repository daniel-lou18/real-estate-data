import type { QueryParams } from "./baseApiService";

export const toQueryParams = (
  params?: Record<string, unknown>
): QueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const queryParams: QueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      const filtered = value.filter(
        (item): item is string | number | boolean =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
      );
      if (filtered.length > 0) {
        queryParams[key] = filtered;
      }
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      queryParams[key] = value;
    }
  });

  return queryParams;
};
