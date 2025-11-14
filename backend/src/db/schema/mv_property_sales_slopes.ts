import { sql, type SQL } from "drizzle-orm";
import {
  integer,
  pgMaterializedView,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import {
  METRIC_FIELDS,
  APARTMENT_COMPOSITION_FIELDS,
  HOUSE_COMPOSITION_FIELDS,
} from "@app/shared";
import {
  apartmentCompositionColumns,
  houseCompositionColumns,
  aggregateColumns,
} from "./shared";
// ----------------------------------------------------------------------------
// Shared column configurations for monthly aggregates
// ----------------------------------------------------------------------------

const monthlyAggregateColumns = {
  insee_code: varchar("insee_code", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  ...aggregateColumns,
} as const;

// ----------------------------------------------------------------------------
// pgTable wrappers for monthly materialized views
// ----------------------------------------------------------------------------

const apartmentsByInseeCodeMonthTable = pgTable(
  "apartments_by_insee_code_month",
  {
    ...monthlyAggregateColumns,
    ...apartmentCompositionColumns,
  }
);

const housesByInseeCodeMonthTable = pgTable("houses_by_insee_code_month", {
  ...monthlyAggregateColumns,
  ...houseCompositionColumns,
});

const apartmentsBySectionMonthTable = pgTable("apartments_by_section_month", {
  ...monthlyAggregateColumns,
  section: varchar("section", { length: 11 }).notNull(),
  ...apartmentCompositionColumns,
});

const housesBySectionMonthTable = pgTable("houses_by_section_month", {
  ...monthlyAggregateColumns,
  section: varchar("section", { length: 11 }).notNull(),
  ...houseCompositionColumns,
});

// ----------------------------------------------------------------------------
// Helpers: latest-year aggregates & slopes
// ----------------------------------------------------------------------------

function tableIdentifier(tableName: string): SQL {
  return sql.raw(`"public"."${tableName}"`);
}

function latestYearSubquery(source: SQL) {
  return sql`(
    select max("year")
    from ${source}
  )`;
}

function columnRef(column: { name: string }, alias: string): SQL {
  return sql.raw(`${alias}."${column.name}"`);
}

function buildLatestYearMetadata(
  table: { year: any; month: any },
  source: SQL,
  alias: string
) {
  const latestYear = latestYearSubquery(source);
  const yearColumn = columnRef(table.year as { name: string }, alias);
  const monthColumn = columnRef(table.month as { name: string }, alias);

  return {
    year: sql<number>`
      max(${yearColumn}) filter (
        where ${yearColumn} = ${latestYear}
      )
    `.as("year"),
    month: sql<number>`
      max(${monthColumn}) filter (
        where ${yearColumn} = ${latestYear}
      )
    `.as("month"),
    window_months: sql<number>`
      (
        count(*) filter (
          where ${yearColumn} = ${latestYear}
        )
      )::int
    `.as("window_months"),
    window_start_year: sql<number | null>`${latestYear}`.as(
      "window_start_year"
    ),
    window_start_month: sql<number | null>`
      min(${monthColumn}) filter (
        where ${yearColumn} = ${latestYear}
      )
    `.as("window_start_month"),
  };
}

function buildLatestYearSlopeMetrics<
  Table extends {
    year: any;
    month: any;
  },
>(metrics: readonly string[], table: Table, source: SQL, alias: string) {
  const latestYear = latestYearSubquery(source);
  const yearColumn = columnRef(table.year, alias);
  const monthColumn = columnRef(table.month, alias);

  return Object.assign(
    {},
    ...metrics.map((metric) => {
      const column = table[metric as keyof typeof table] as { name: string };
      const metricColumn = columnRef(column, alias);
      return {
        [`${metric}_slope`]: sql<number | null>`
          round(
            (
              regr_slope(
                ${metricColumn}::double precision,
                (${yearColumn} * 12 + ${monthColumn})::double precision
              ) filter (
                where ${yearColumn} = ${latestYear}
              )
            )::numeric,
            6
          )::double precision
        `.as(`${metric}_slope`),
      };
    })
  );
}

// ----------------------------------------------------------------------------
// Materialized views: 12-month regression slopes
// ----------------------------------------------------------------------------

export const apartments_by_insee_code_month_slopes = pgMaterializedView(
  "apartments_by_insee_code_month_slopes"
).as((qb) => {
  const source = tableIdentifier("apartments_by_insee_code_month");
  const aggregates = buildLatestYearSlopeMetrics(
    METRIC_FIELDS,
    apartmentsByInseeCodeMonthTable,
    source,
    "current"
  );
  const composition = buildLatestYearSlopeMetrics(
    APARTMENT_COMPOSITION_FIELDS,
    apartmentsByInseeCodeMonthTable,
    source,
    "current"
  );
  const metadata = buildLatestYearMetadata(
    apartmentsByInseeCodeMonthTable,
    source,
    "current"
  );

  return qb
    .select({
      inseeCode:
        sql<string>`current.${apartmentsByInseeCodeMonthTable.insee_code}`.as(
          "insee_code"
        ),
      year: metadata.year,
      month: metadata.month,
      window_months: metadata.window_months,
      window_start_year: metadata.window_start_year,
      window_start_month: metadata.window_start_month,
      ...aggregates,
      ...composition,
    })
    .from(sql`apartments_by_insee_code_month AS current`)
    .groupBy(sql`current.${apartmentsByInseeCodeMonthTable.insee_code}`);
});

export const houses_by_insee_code_month_slopes = pgMaterializedView(
  "houses_by_insee_code_month_slopes"
).as((qb) => {
  const source = tableIdentifier("houses_by_insee_code_month");
  const aggregates = buildLatestYearSlopeMetrics(
    METRIC_FIELDS,
    housesByInseeCodeMonthTable,
    source,
    "current"
  );
  const composition = buildLatestYearSlopeMetrics(
    HOUSE_COMPOSITION_FIELDS,
    housesByInseeCodeMonthTable,
    source,
    "current"
  );
  const metadata = buildLatestYearMetadata(
    housesByInseeCodeMonthTable,
    source,
    "current"
  );

  return qb
    .select({
      inseeCode:
        sql<string>`current.${housesByInseeCodeMonthTable.insee_code}`.as(
          "insee_code"
        ),
      year: metadata.year,
      month: metadata.month,
      window_months: metadata.window_months,
      window_start_year: metadata.window_start_year,
      window_start_month: metadata.window_start_month,
      ...aggregates,
      ...composition,
    })
    .from(sql`houses_by_insee_code_month AS current`)
    .groupBy(sql`current.${housesByInseeCodeMonthTable.insee_code}`);
});

export const apartments_by_section_month_slopes = pgMaterializedView(
  "apartments_by_section_month_slopes"
).as((qb) => {
  const source = tableIdentifier("apartments_by_section_month");
  const aggregates = buildLatestYearSlopeMetrics(
    METRIC_FIELDS,
    apartmentsBySectionMonthTable,
    source,
    "current"
  );
  const composition = buildLatestYearSlopeMetrics(
    APARTMENT_COMPOSITION_FIELDS,
    apartmentsBySectionMonthTable,
    source,
    "current"
  );
  const metadata = buildLatestYearMetadata(
    apartmentsBySectionMonthTable,
    source,
    "current"
  );

  return qb
    .select({
      inseeCode:
        sql<string>`current.${apartmentsBySectionMonthTable.insee_code}`.as(
          "insee_code"
        ),
      section: sql<string>`current.${apartmentsBySectionMonthTable.section}`.as(
        "section"
      ),
      year: metadata.year,
      month: metadata.month,
      window_months: metadata.window_months,
      window_start_year: metadata.window_start_year,
      window_start_month: metadata.window_start_month,
      ...aggregates,
      ...composition,
    })
    .from(sql`apartments_by_section_month AS current`)
    .groupBy(
      sql`current.${apartmentsBySectionMonthTable.insee_code}`,
      sql`current.${apartmentsBySectionMonthTable.section}`
    );
});

export const houses_by_section_month_slopes = pgMaterializedView(
  "houses_by_section_month_slopes"
).as((qb) => {
  const source = tableIdentifier("houses_by_section_month");
  const aggregates = buildLatestYearSlopeMetrics(
    METRIC_FIELDS,
    housesBySectionMonthTable,
    source,
    "current"
  );
  const composition = buildLatestYearSlopeMetrics(
    HOUSE_COMPOSITION_FIELDS,
    housesBySectionMonthTable,
    source,
    "current"
  );
  const metadata = buildLatestYearMetadata(
    housesBySectionMonthTable,
    source,
    "current"
  );

  return qb
    .select({
      inseeCode:
        sql<string>`current.${housesBySectionMonthTable.insee_code}`.as(
          "insee_code"
        ),
      section: sql<string>`current.${housesBySectionMonthTable.section}`.as(
        "section"
      ),
      year: metadata.year,
      month: metadata.month,
      window_months: metadata.window_months,
      window_start_year: metadata.window_start_year,
      window_start_month: metadata.window_start_month,
      ...aggregates,
      ...composition,
    })
    .from(sql`houses_by_section_month AS current`)
    .groupBy(
      sql`current.${housesBySectionMonthTable.insee_code}`,
      sql`current.${housesBySectionMonthTable.section}`
    );
});

// ----------------------------------------------------------------------------
// Index helpers for slope views
// ----------------------------------------------------------------------------

export const aggregate_slope_mv_indexes = {
  apts_insee_month_slope_keys: sql`
    create index if not exists idx_apts_insee_month_slopes
      on apartments_by_insee_code_month_slopes (insee_code)
  `,
  houses_insee_month_slope_keys: sql`
    create index if not exists idx_houses_insee_month_slopes
      on houses_by_insee_code_month_slopes (insee_code)
  `,
  apts_section_month_slope_keys: sql`
    create index if not exists idx_apts_section_month_slopes
      on apartments_by_section_month_slopes (insee_code, section)
  `,
  houses_section_month_slope_keys: sql`
    create index if not exists idx_houses_section_month_slopes
      on houses_by_section_month_slopes (insee_code, section)
  `,
};

// ----------------------------------------------------------------------------
// Select schemas
// ----------------------------------------------------------------------------

export const SelectApartmentsByInseeCodeMonthSlopeSchema = createSelectSchema(
  apartments_by_insee_code_month_slopes
);
export const SelectHousesByInseeCodeMonthSlopeSchema = createSelectSchema(
  houses_by_insee_code_month_slopes
);
export const SelectApartmentsBySectionMonthSlopeSchema = createSelectSchema(
  apartments_by_section_month_slopes
);
export const SelectHousesBySectionMonthSlopeSchema = createSelectSchema(
  houses_by_section_month_slopes
);
