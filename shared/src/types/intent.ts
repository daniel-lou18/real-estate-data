import type {
  DimensionField,
  Year,
  Month,
  FeatureLevel,
  PropertyType,
} from "./dimensions";
import type { MetricField } from "./metrics";
import type {
  NumericFilterSchema,
  UserIntentSchema,
} from "../schemas/intent.schemas";
import { z } from "zod";

export interface FilterState {
  level: FeatureLevel;
  propertyType: PropertyType;
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

export type UserIntent = z.infer<typeof UserIntentSchema>;

export type NumericFilter = z.infer<typeof NumericFilterSchema>;
