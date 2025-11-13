import z from "zod";
const IntentCategorySchema = z.enum([
    "query",
    "aggregate",
    "compute",
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
const SortSchema = z.array(z.object({
    field: AllowedColumnsSchema,
    dir: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
}));
const LimitSchema = z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Limit the number of results");
const OffsetSchema = z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Offset the results");
export const QuerySchema = z.object({
    select: z
        .array(AllowedColumnsSchema)
        .optional()
        .describe("Columns to select."),
    filters: z.array(FilterSchema).optional().describe("Filters to apply"),
    sort: SortSchema.optional().describe("Sort to apply"),
    limit: LimitSchema,
    offset: OffsetSchema,
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
const AggregationMetricSchema = z
    .enum(["count", "sum", "avg", "min", "max"])
    .describe("Allowed metrics to use in the aggregation");
const MetricSchema = z.object({
    metric: AggregationMetricSchema,
    field: AllowedColumnsSchema,
});
export const AggregationSchema = z.object({
    groupBy: z
        .array(AllowedGroupBySchema)
        .optional()
        .describe("Column(s) to group by"),
    metrics: z.array(MetricSchema).optional().describe("Metrics to compute"),
    filters: z.array(FilterSchema).optional().describe("Filters to apply"),
    sort: SortSchema.optional().describe("Sort to apply"),
    limit: LimitSchema,
});
const PercentileSchema = z.object({
    name: z.literal("percentile").describe("Name of the computation"),
    percentileValue: z
        .number()
        .min(0)
        .max(100)
        .describe("Value of the percentile"),
    field: AllowedColumnsSchema,
});
const AvgPricePerM2Schema = z.object({
    name: z.literal("avgPricePerM2").describe("Name of the computation"),
});
export const ComputationTypeSchema = z.discriminatedUnion("name", [
    PercentileSchema,
    AvgPricePerM2Schema,
]);
export const ComputationSchema = z.object({
    computations: z
        .array(ComputationTypeSchema)
        .describe("Computations to execute"),
    groupBy: z
        .array(AllowedGroupBySchema)
        .optional()
        .describe("Column(s) to group by"),
    filters: z.array(FilterSchema).optional().describe("Filters to apply"),
    sort: SortSchema.optional().describe("Sort to apply"),
    limit: LimitSchema,
});
export const SQLSchema = z.object({
    query: z.string().describe("SQL retrieval query to execute"),
});
