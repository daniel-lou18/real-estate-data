import { and, eq, sql } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { pgMaterializedView } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { DOUBLE_PRECISION_METRICS } from "./constants";
import { METRIC_FIELDS, APARTMENT_COMPOSITION_FIELDS, HOUSE_COMPOSITION_FIELDS, } from "@app/shared";
import { aggregateColumns, apartmentCompositionColumns, houseCompositionColumns, } from "./shared";
// ----------------------------------------------------------------------------
// pgTable wrappers for materialized views (for aliasing and type safety)
// ----------------------------------------------------------------------------
/**
 * Shared column definitions for yearly aggregate metrics.
 * These match the structure of apartments_by_insee_code_year and houses_by_insee_code_year.
 */
const yearlyAggregateColumns = {
    insee_code: varchar("insee_code", { length: 10 }).notNull(),
    year: integer("year").notNull(),
    ...aggregateColumns,
};
/**
 * pgTable wrapper for apartments_by_insee_code_year materialized view.
 * Used for aliasing and type-safe column references.
 */
const apartmentsByInseeCodeYearTable = pgTable("apartments_by_insee_code_year", {
    ...yearlyAggregateColumns,
    ...apartmentCompositionColumns,
});
/**
 * pgTable wrapper for houses_by_insee_code_year materialized view.
 */
const housesByInseeCodeYearTable = pgTable("houses_by_insee_code_year", {
    ...yearlyAggregateColumns,
    ...houseCompositionColumns,
});
/**
 * pgTable wrapper for apartments_by_section_year materialized view.
 */
const apartmentsBySectionYearTable = pgTable("apartments_by_section_year", {
    ...yearlyAggregateColumns,
    ...apartmentCompositionColumns,
    section: varchar("section", { length: 11 }).notNull(),
});
/**
 * pgTable wrapper for houses_by_section_year materialized view.
 */
const housesBySectionYearTable = pgTable("houses_by_section_year", {
    ...yearlyAggregateColumns,
    ...houseCompositionColumns,
    section: varchar("section", { length: 11 }).notNull(),
});
/**
 * Calculates percentage change: 100 * (current - base) / base
 * Returns NULL if base is NULL or 0.
 * Casts result to double precision to match SQL migration.
 */
function pctChange(current, base) {
    return sql `
    CASE
      WHEN ${base} IS NULL OR ${base} = 0 THEN NULL
      ELSE round((100.0 * (${current} - ${base}) / ${base})::numeric, 2)::double precision
    END
  `;
}
/**
 * Builds delta metrics for a given metric field.
 * Returns base, current, delta, and pct_change for a single metric.
 * Handles double precision casting for numeric fields to match SQL migration.
 */
function buildMetricDelta(currentCol, baseCol, metricName, needsDoublePrecision = false) {
    if (needsDoublePrecision) {
        return {
            [`${metricName}_base`]: sql `${baseCol}::double precision`.as(`${metricName}_base`),
            [`${metricName}_current`]: sql `${currentCol}::double precision`.as(`${metricName}_current`),
            [`${metricName}_delta`]: sql `(${currentCol}::double precision - ${baseCol}::double precision)::double precision`.as(`${metricName}_delta`),
            [`${metricName}_pct_change`]: pctChange(sql `${currentCol}::double precision`, sql `${baseCol}::double precision`).as(`${metricName}_pct_change`),
        };
    }
    return {
        [`${metricName}_base`]: baseCol.as(`${metricName}_base`),
        [`${metricName}_current`]: currentCol.as(`${metricName}_current`),
        [`${metricName}_delta`]: sql `${currentCol} - ${baseCol}`.as(`${metricName}_delta`),
        [`${metricName}_pct_change`]: pctChange(currentCol, baseCol).as(`${metricName}_pct_change`),
    };
}
/**
 * Builds all delta metrics from a list of metric names.
 * Uses column objects directly from the table definition for type safety.
 * Handles double precision casting for numeric fields to match SQL migration.
 */
function buildDeltasFromMetrics(metrics, currentTable, baseTable) {
    return Object.assign({}, ...metrics.map((metric) => {
        const currentCol = currentTable[metric];
        const baseCol = baseTable[metric];
        const needsDoublePrecision = DOUBLE_PRECISION_METRICS.includes(metric);
        return buildMetricDelta(sql `current.${currentCol}`, sql `base.${baseCol}`, metric, needsDoublePrecision);
    }));
}
// ----------------------------------------------------------------------------
// Yearly deltas by INSEE code
// ----------------------------------------------------------------------------
export const apartments_by_insee_code_year_deltas = pgMaterializedView("apartments_by_insee_code_year_deltas").as((qb) => {
    const current = apartmentsByInseeCodeYearTable;
    const base = apartmentsByInseeCodeYearTable;
    return qb
        .select({
        inseeCode: sql `current.${current.insee_code}`.as("insee_code"),
        year: sql `current.${current.year}`.as("year"),
        base_year: sql `base.${base.year}`.as("base_year"),
        ...buildDeltasFromMetrics(METRIC_FIELDS, current, base),
        ...buildDeltasFromMetrics(APARTMENT_COMPOSITION_FIELDS, current, base),
    })
        .from(sql `apartments_by_insee_code_year AS current`)
        .innerJoin(sql `apartments_by_insee_code_year AS base`, and(eq(sql `current.${current.insee_code}`, sql `base.${base.insee_code}`), eq(sql `current.${current.year}`, sql `base.${base.year} + 1`)));
});
export const houses_by_insee_code_year_deltas = pgMaterializedView("houses_by_insee_code_year_deltas").as((qb) => {
    const current = housesByInseeCodeYearTable;
    const base = housesByInseeCodeYearTable;
    return qb
        .select({
        inseeCode: sql `current.${current.insee_code}`.as("insee_code"),
        year: sql `current.${current.year}`.as("year"),
        base_year: sql `base.${base.year}`.as("base_year"),
        ...buildDeltasFromMetrics(METRIC_FIELDS, current, base),
        ...buildDeltasFromMetrics(HOUSE_COMPOSITION_FIELDS, current, base),
    })
        .from(sql `houses_by_insee_code_year AS current`)
        .innerJoin(sql `houses_by_insee_code_year AS base`, and(eq(sql `current.${current.insee_code}`, sql `base.${base.insee_code}`), eq(sql `current.${current.year}`, sql `base.${base.year} + 1`)));
});
// ----------------------------------------------------------------------------
// Yearly deltas by section
// ----------------------------------------------------------------------------
export const apartments_by_section_year_deltas = pgMaterializedView("apartments_by_section_year_deltas").as((qb) => {
    const current = apartmentsBySectionYearTable;
    const base = apartmentsBySectionYearTable;
    return qb
        .select({
        inseeCode: sql `current.${current.insee_code}`.as("insee_code"),
        section: sql `current.${current.section}`.as("section"),
        year: sql `current.${current.year}`.as("year"),
        base_year: sql `base.${base.year}`.as("base_year"),
        ...buildDeltasFromMetrics(METRIC_FIELDS, current, base),
        ...buildDeltasFromMetrics(APARTMENT_COMPOSITION_FIELDS, current, base),
    })
        .from(sql `apartments_by_section_year AS current`)
        .innerJoin(sql `apartments_by_section_year AS base`, and(eq(sql `current.${current.section}`, sql `base.${base.section}`), eq(sql `current.${current.year}`, sql `base.${base.year} + 1`)));
});
export const houses_by_section_year_deltas = pgMaterializedView("houses_by_section_year_deltas").as((qb) => {
    const current = housesBySectionYearTable;
    const base = housesBySectionYearTable;
    return qb
        .select({
        inseeCode: sql `current.${current.insee_code}`.as("insee_code"),
        section: sql `current.${current.section}`.as("section"),
        year: sql `current.${current.year}`.as("year"),
        base_year: sql `base.${base.year}`.as("base_year"),
        ...buildDeltasFromMetrics(METRIC_FIELDS, current, base),
        ...buildDeltasFromMetrics(HOUSE_COMPOSITION_FIELDS, current, base),
    })
        .from(sql `houses_by_section_year AS current`)
        .innerJoin(sql `houses_by_section_year AS base`, and(eq(sql `current.${current.section}`, sql `base.${base.section}`), eq(sql `current.${current.year}`, sql `base.${base.year} + 1`)));
});
// ----------------------------------------------------------------------------
// Indexes for delta views
// ----------------------------------------------------------------------------
export const delta_mv_indexes = {
    apts_insee_year_deltas_keys: sql `
    create index if not exists idx_apts_insee_year_deltas
    on apartments_by_insee_code_year_deltas (insee_code, year, base_year)
  `,
    houses_insee_year_deltas_keys: sql `
    create index if not exists idx_houses_insee_year_deltas
    on houses_by_insee_code_year_deltas (insee_code, year, base_year)
  `,
    apts_section_year_deltas_keys: sql `
    create index if not exists idx_apts_section_year_deltas
    on apartments_by_section_year_deltas (section, year, base_year)
  `,
    houses_section_year_deltas_keys: sql `
    create index if not exists idx_houses_section_year_deltas
    on houses_by_section_year_deltas (section, year, base_year)
  `,
};
// ----------------------------------------------------------------------------
// Zod schemas for delta views
// ----------------------------------------------------------------------------
export const SelectApartmentsByInseeCodeYearDeltasSchema = createSelectSchema(apartments_by_insee_code_year_deltas);
export const SelectHousesByInseeCodeYearDeltasSchema = createSelectSchema(houses_by_insee_code_year_deltas);
export const SelectApartmentsBySectionYearDeltasSchema = createSelectSchema(apartments_by_section_year_deltas);
export const SelectHousesBySectionYearDeltasSchema = createSelectSchema(houses_by_section_year_deltas);
