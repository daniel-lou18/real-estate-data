import type {
  DimensionField,
  Year,
  Month,
  FeatureLevel,
  PropertyTypeField,
  MetricField,
} from "@/routes/sales/shared/types";
import { NumericFilterSchema, UserIntentSchema } from "./schemas";
import type { z } from "zod";

export type NumericFilter = z.infer<typeof NumericFilterSchema>;

export type UserIntent = z.infer<typeof UserIntentSchema>;

export interface FilterState {
  level: FeatureLevel;
  propertyType: PropertyTypeField;
  field: MetricField;
  year: Year;
  inseeCodes: string[];
  sections: string[];
  month?: Month;
  filters?: NumericFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  bbox?: [number, number, number, number];
}
