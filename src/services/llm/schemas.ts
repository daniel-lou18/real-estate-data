import z from "zod";

const IntentCategorySchema = z.enum([
  "query",
  "aggregate",
  "calculate",
  "schema",
  "explain",
  "compare",
  "unknown",
]);

export const IntentSchema = z.object({
  category: IntentCategorySchema.describe("Category of the intent"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score of the intent"),
  explanation: z.string().describe("Explanation of the chosen intent"),
});

export type Intent = z.infer<typeof IntentSchema>;

const AllowedColumnsSchema = z
  .enum([
    "date",
    "year",
    "month",
    "primaryInseeCode",
    "primarySection",
    "price",
    "nbProperties",
    "nbHouses",
    "nbApartments",
    "nbWorkspaces",
    "nbSecondaryUnits",
    "nbapt1pp",
    "nbapt2pp",
    "nbapt3pp",
    "nbapt4pp",
    "nbapt5pp",
    "nbmai1pp",
    "nbmai2pp",
    "nbmai3pp",
    "nbmai4pp",
    "nbmai5pp",
    "floorArea",
    "ApartmentFloorArea",
    "HouseFloorArea",
    "WorkspaceFloorArea",
    "sapt1pp",
    "sapt2pp",
    "sapt3pp",
    "sapt4pp",
    "sapt5pp",
    "smai1pp",
    "smai2pp",
    "smai3pp",
    "smai4pp",
    "smai5pp",
    "propertyTypeCode",
    "propertyTypeLabel",
  ])
  .describe("Allowed columns to use in the query");

const FilterSchema = z.object({
  field: AllowedColumnsSchema,
  operator: z
    .enum([
      "=",
      "!=",
      ">",
      ">=",
      "<",
      "<=",
      "between",
      "in",
      "ilike",
      "is_null",
    ])
    .describe("Allowed operators to use in the filter"),
  value: z.any().optional().describe("Value to filter by"),
});

const SortSchema = z.array(
  z.object({
    field: AllowedColumnsSchema,
    dir: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
  })
);

export const QuerySchema = z.object({
  select: z
    .array(AllowedColumnsSchema)
    .optional()
    .describe("Columns to select."),
  filters: z.array(FilterSchema).optional().describe("Filters to apply"),
  sort: SortSchema.optional().describe("Sort to apply"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe("Limit the number of results"),
  offset: z.number().int().min(0).optional().describe("Offset the results"),
});

const AllowedGroupBySchema = z
  .enum([
    "date",
    "year",
    "month",
    "primaryInseeCode",
    "primarySection",
    "propertyTypeCode",
    "propertyTypeLabel",
  ])
  .describe("Allowed group by columns to use in the aggregation");

const MetricSchema = z
  .enum(["count", "sum", "avg", "min", "max", "percentile"])
  .describe("Allowed metrics to use in the aggregation");

export const AggregationSchema = z.object({
  groupBy: z.array(AllowedGroupBySchema).describe("Column(s) to group by"),
  metrics: z
    .array(
      z.object({
        metric: MetricSchema,
        field: AllowedColumnsSchema,
      })
    )
    .describe("Metrics to compute"),
  filters: z.array(FilterSchema).optional().describe("Filters to apply"),
  sort: SortSchema.optional().describe("Sort to apply"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Limit the number of results"),
});

export type AllowedColumns = z.infer<typeof AllowedColumnsSchema>;
export type AllowedGroupBy = z.infer<typeof AllowedGroupBySchema>;
