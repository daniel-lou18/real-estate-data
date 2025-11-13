import type { NumericFilterSchema } from "@/services/api/schemas/userIntent";
import type { DimensionField, Year, Month } from "./dimensions";
import type { MetricField } from "./metrics";
import type z from "zod";

type Intent = "rank" | "filter" | "compare" | "show";

export type UserIntent = {
  intent: Intent;
  primaryDimension?: DimensionField;
  metric?: MetricField;
  year?: Year;
  month?: Month;
  filters?: Record<string, string | number | boolean>;
  limit?: number;
  sortOrder?: "asc" | "desc";
  minSales?: number;
};

export type NumericFilter = z.infer<typeof NumericFilterSchema>;
