import { z } from "zod";

/**
 * Base aggregation metrics that apply to all analytics endpoints
 * These represent common statistics computed across grouped sales data
 */
const BaseAggregationMetrics = z.object({
  // Transaction count
  count: z
    .number()
    .int()
    .describe("Total number of transactions in this group"),

  // Price aggregates (in euros)
  totalPrice: z.number().describe("Sum of all transaction prices"),
  avgPrice: z.number().describe("Average transaction price"),
  minPrice: z.number().describe("Minimum transaction price"),
  maxPrice: z.number().describe("Maximum transaction price"),
  medianPrice: z
    .number()
    .optional()
    .describe("Median transaction price (if computed)"),

  // Floor area aggregates (in m²)
  totalFloorArea: z.number().describe("Sum of all floor areas"),
  avgFloorArea: z.number().describe("Average floor area per transaction"),
  minFloorArea: z.number().optional().describe("Minimum floor area"),
  maxFloorArea: z.number().optional().describe("Maximum floor area"),

  // Computed metrics (calculated AFTER aggregation)
  avgPricePerM2: z
    .number()
    .nullable()
    .describe(
      "Average price per m² (totalPrice / totalFloorArea). Null if no valid floor area."
    ),
});

/**
 * Property type breakdown within a group
 * Useful for understanding composition of sales
 */
const PropertyTypeBreakdown = z.object({
  totalProperties: z.number().int().describe("Total number of properties sold"),
  totalApartments: z.number().int().describe("Total number of apartments sold"),
  totalHouses: z.number().int().describe("Total number of houses sold"),
  totalWorkspaces: z
    .number()
    .int()
    .describe("Total number of workspaces/commercial units sold"),
  totalSecondaryUnits: z
    .number()
    .int()
    .describe("Total number of secondary units (dependencies)"),
});

/**
 * Apartment room distribution
 * Shows distribution of apartments by room count (pp = pièces principales)
 */
const ApartmentRoomDistribution = z.object({
  apt1Room: z.number().int().describe("Number of 1-room apartments (studios)"),
  apt2Room: z.number().int().describe("Number of 2-room apartments"),
  apt3Room: z.number().int().describe("Number of 3-room apartments"),
  apt4Room: z.number().int().describe("Number of 4-room apartments"),
  apt5Room: z.number().int().describe("Number of 5 room apartments"),
});

/**
 * House room distribution
 * Shows distribution of houses by room count (pp = pièces principales)
 */
const HouseRoomDistribution = z.object({
  house1Room: z.number().int().describe("Number of 1-room houses"),
  house2Room: z.number().int().describe("Number of 2-room houses"),
  house3Room: z.number().int().describe("Number of 3-room houses"),
  house4Room: z.number().int().describe("Number of 4-room houses"),
  house5Room: z.number().int().describe("Number of 5 room houses"),
});

/**
 * Apartment-specific statistics
 * Metrics calculated from pure apartment transactions only
 */
const ApartmentSpecificStats = z.object({
  apartmentTransactionCount: z
    .number()
    .int()
    .describe("Number of pure apartment transactions"),
  apartmentTotalPrice: z
    .number()
    .describe("Total price of apartment transactions"),
  apartmentAvgPrice: z
    .number()
    .describe("Average price of apartment transactions"),
  apartmentTotalFloorArea: z
    .number()
    .describe("Total floor area of apartments"),
  apartmentAvgFloorArea: z
    .number()
    .describe("Average floor area per apartment"),
  apartmentAvgPricePerM2: z
    .number()
    .nullable()
    .describe("Average price per m² for apartments"),
});

/**
 * House-specific statistics
 * Metrics calculated from pure house transactions only
 */
const HouseSpecificStats = z.object({
  houseTransactionCount: z
    .number()
    .int()
    .describe("Number of pure house transactions"),
  houseTotalPrice: z.number().describe("Total price of house transactions"),
  houseAvgPrice: z.number().describe("Average price of house transactions"),
  houseTotalFloorArea: z.number().describe("Total floor area of houses"),
  houseAvgFloorArea: z.number().describe("Average floor area per house"),
  houseAvgPricePerM2: z
    .number()
    .nullable()
    .describe("Average price per m² for houses"),
});

// ============================================================================
// Analytics Response Schemas
// ============================================================================

/**
 * Schema for sales grouped by INSEE code (postal code)
 * Each object represents aggregated sales data for one INSEE code
 */
export const SalesByInseeCodeSchema = BaseAggregationMetrics.extend({
  inseeCode: z
    .string()
    .describe("INSEE code (French postal/administrative code)"),

  ...PropertyTypeBreakdown.shape,
  ...ApartmentSpecificStats.shape,
  ...HouseSpecificStats.shape,
  ...ApartmentRoomDistribution.shape,
  ...HouseRoomDistribution.shape,
});

/**
 * Schema for sales grouped by section (French administrative division)
 * Each object represents aggregated sales data for one section
 */
export const SalesByInseeCodeAndSectionSchema = BaseAggregationMetrics.extend({
  inseeCode: z
    .string()
    .describe("INSEE code (French postal/administrative code)"),
  section: z.string().describe("Section code (French administrative division)"),

  ...PropertyTypeBreakdown.shape,
  ...ApartmentSpecificStats.shape,
  ...HouseSpecificStats.shape,
  ...ApartmentRoomDistribution.shape,
  ...HouseRoomDistribution.shape,
});

/**
 * Schema for sales grouped by property type
 * Each object represents aggregated sales data for one property type
 */
export const SalesByPropertyTypeSchema = BaseAggregationMetrics.extend({
  propertyTypeCode: z.number().int().describe("Property type code"),
  propertyTypeLabel: z
    .string()
    .describe("Property type label (human-readable)"),
});

/**
 * Schema for sales grouped by year
 * Each object represents aggregated sales data for one year
 */
export const SalesByYearSchema = BaseAggregationMetrics.extend({
  year: z.number().int().describe("Year of transactions"),

  // Property type breakdown (flat fields)
  ...PropertyTypeBreakdown.shape,

  // Optional: Monthly distribution
  monthlyDistribution: z
    .array(
      z.object({
        month: z.number().int().min(1).max(12),
        count: z.number().int(),
        avgPrice: z.number(),
      })
    )
    .optional(),
});

/**
 * Schema for sales grouped by year and month
 * Each object represents aggregated sales data for one month
 */
export const SalesByMonthSchema = BaseAggregationMetrics.extend({
  year: z.number().int().describe("Year of transactions"),
  month: z
    .number()
    .int()
    .min(1)
    .max(12)
    .describe("Month of transactions (1-12)"),

  // Property type breakdown (flat fields)
  ...PropertyTypeBreakdown.shape,
});

/**
 * Overall summary statistics (no grouping)
 * Provides a high-level overview of all sales data
 */
export const SalesSummarySchema = BaseAggregationMetrics.extend({
  // Time period covered
  earliestDate: z
    .string()
    .optional()
    .describe("Earliest transaction date in dataset"),
  latestDate: z
    .string()
    .optional()
    .describe("Latest transaction date in dataset"),

  // Geographic coverage
  uniqueDepartments: z
    .number()
    .int()
    .optional()
    .describe("Number of unique departments"),
  uniqueInseeCodes: z
    .number()
    .int()
    .optional()
    .describe("Number of unique INSEE codes"),
  // Property type breakdown (flat fields)
  ...PropertyTypeBreakdown.shape,
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Common query parameters for filtering analytics
 */
export const AnalyticsQueryParamsSchema = z.object({
  // Time filters
  year: z.coerce.number().int().optional().describe("Filter by specific year"),
  startYear: z.coerce
    .number()
    .int()
    .optional()
    .describe("Filter by start year (inclusive)"),
  endYear: z.coerce
    .number()
    .int()
    .optional()
    .describe("Filter by end year (inclusive)"),
  startDate: z
    .string()
    .optional()
    .describe("Filter by start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter by end date (YYYY-MM-DD)"),

  // Location filters
  depCode: z.string().optional().describe("Filter by department code"),
  inseeCode: z.string().optional().describe("Filter by specific INSEE code"),
  section: z.string().optional().describe("Filter by section code"),

  // Property type filters
  propertyTypeCode: z.coerce
    .number()
    .int()
    .optional()
    .describe("Filter by property type code"),

  // Pagination
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Maximum number of results"),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip"),

  // Sorting
  sortBy: z
    .enum([
      "count",
      "totalPrice",
      "avgPrice",
      "avgPricePerM2",
      "totalFloorArea",
    ])
    .optional()
    .describe("Field to sort by"),
  sortOrder: z.enum(["asc", "desc"]).default("desc").describe("Sort order"),
});

// ============================================================================
// Type exports
// ============================================================================

/**
 * Schema for a single decile value
 */
const DecileValueSchema = z.object({
  percentile: z
    .number()
    .int()
    .min(1)
    .max(100)
    .describe("Percentile value (10, 20, 30, etc.)"),
  value: z.number().nullable().describe("The decile value (price per m²)"),
});

/**
 * Schema for price per m² deciles across the whole dataset
 * Each decile represents the price per m² value that divides the dataset into 10 equal groups
 */
export const PricePerM2DecilesSchema = z.object({
  deciles: z
    .array(DecileValueSchema)
    .length(10)
    .describe("Array of 10 decile values from 10th to 100th percentile"),
  totalTransactions: z
    .number()
    .int()
    .describe("Total number of transactions analyzed"),
});

export type SalesByInseeCode = z.infer<typeof SalesByInseeCodeSchema>;
export type SalesByInseeCodeAndSection = z.infer<
  typeof SalesByInseeCodeAndSectionSchema
>;
export type SalesByPropertyType = z.infer<typeof SalesByPropertyTypeSchema>;
export type SalesByYear = z.infer<typeof SalesByYearSchema>;
export type SalesByMonth = z.infer<typeof SalesByMonthSchema>;
export type SalesSummary = z.infer<typeof SalesSummarySchema>;
export type AnalyticsQueryParams = z.infer<typeof AnalyticsQueryParamsSchema>;
export type PricePerM2Deciles = z.infer<typeof PricePerM2DecilesSchema>;
