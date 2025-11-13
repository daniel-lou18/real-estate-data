import { z } from "zod";
import type { MetricField } from "@/types";

// ----------------------------------------------------------------------------
// Shared metric schemas for MV responses
// ----------------------------------------------------------------------------

export const AggregateMetricsMVSchema = z.object<
  Record<MetricField, z.ZodType<number>>
>({
  // Counts and totals
  total_sales: z.coerce.number().int().describe("Total number of transactions"),
  total_price: z.coerce.number().describe("Sum of transaction prices"),
  avg_price: z.coerce.number().describe("Average transaction price"),

  // Areas
  total_area: z.coerce.number().describe("Sum of area for the group"),
  avg_area: z.coerce.number().describe("Average area for the group"),

  // Weighted price per m²
  avg_price_m2: z.coerce
    .number()
    .describe("SUM(price) / NULLIF(SUM(area), 0) at group level"),

  // Distribution statistics
  min_price: z.coerce.number(),
  max_price: z.coerce.number(),
  median_price: z.coerce.number(),
  median_area: z.coerce.number(),
  min_price_m2: z.coerce.number(),
  max_price_m2: z.coerce.number(),
  price_m2_p25: z.coerce.number(),
  price_m2_p75: z.coerce.number(),
  price_m2_iqr: z.coerce.number(),
  price_m2_stddev: z.coerce.number(),
});

// Apartment composition
export const ApartmentComposition = z.object({
  total_apartments: z.coerce.number().int(),
  apartment_1_room: z.coerce.number().int(),
  apartment_2_room: z.coerce.number().int(),
  apartment_3_room: z.coerce.number().int(),
  apartment_4_room: z.coerce.number().int(),
  apartment_5_room: z.coerce.number().int(),
});

// House composition
export const HouseComposition = z.object({
  total_houses: z.coerce.number().int(),
  house_1_room: z.coerce.number().int(),
  house_2_room: z.coerce.number().int(),
  house_3_room: z.coerce.number().int(),
  house_4_room: z.coerce.number().int(),
  house_5_room: z.coerce.number().int(),
});
