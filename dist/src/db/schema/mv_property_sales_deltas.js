import { and, eq, sql } from "drizzle-orm";
import { integer, numeric, pgTable, varchar } from "drizzle-orm/pg-core";
import { pgMaterializedView } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
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
    total_sales: integer("total_sales").notNull(),
    total_price: numeric("total_price", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    avg_price: numeric("avg_price", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    total_area: numeric("total_area", {
        precision: 10,
        scale: 1,
        mode: "number",
    }).notNull(),
    avg_area: numeric("avg_area", {
        precision: 10,
        scale: 1,
        mode: "number",
    }).notNull(),
    avg_price_m2: numeric("avg_price_m2", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    min_price: numeric("min_price", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    max_price: numeric("max_price", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    median_price: numeric("median_price", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    median_area: numeric("median_area", {
        precision: 10,
        scale: 1,
        mode: "number",
    }).notNull(),
    min_price_m2: numeric("min_price_m2", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    max_price_m2: numeric("max_price_m2", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    price_m2_p25: numeric("price_m2_p25", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    price_m2_p75: numeric("price_m2_p75", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    price_m2_iqr: numeric("price_m2_iqr", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
    price_m2_stddev: numeric("price_m2_stddev", {
        precision: 15,
        scale: 0,
        mode: "number",
    }).notNull(),
};
/**
 * Apartment composition columns.
 */
const apartmentCompositionColumns = {
    total_apartments: integer("total_apartments").notNull(),
    apartment_1_room: integer("apartment_1_room").notNull(),
    apartment_2_room: integer("apartment_2_room").notNull(),
    apartment_3_room: integer("apartment_3_room").notNull(),
    apartment_4_room: integer("apartment_4_room").notNull(),
    apartment_5_room: integer("apartment_5_room").notNull(),
};
/**
 * House composition columns.
 */
const houseCompositionColumns = {
    total_houses: integer("total_houses").notNull(),
    house_1_room: integer("house_1_room").notNull(),
    house_2_room: integer("house_2_room").notNull(),
    house_3_room: integer("house_3_room").notNull(),
    house_4_room: integer("house_4_room").notNull(),
    house_5_room: integer("house_5_room").notNull(),
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
// ----------------------------------------------------------------------------
// Centralized metric lists
// ----------------------------------------------------------------------------
const AGG_METRICS = [
    "total_sales",
    "total_price",
    "avg_price",
    "total_area",
    "avg_area",
    "avg_price_m2",
    "median_price",
    "median_area",
    "price_m2_p25",
    "price_m2_p75",
    "price_m2_iqr",
    "price_m2_stddev",
];
const APARTMENT_COMPOSITION_METRICS = [
    "total_apartments",
    "apartment_1_room",
    "apartment_2_room",
    "apartment_3_room",
    "apartment_4_room",
    "apartment_5_room",
];
const HOUSE_COMPOSITION_METRICS = [
    "total_houses",
    "house_1_room",
    "house_2_room",
    "house_3_room",
    "house_4_room",
    "house_5_room",
];
// ----------------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------------
/**
 * Calculates percentage change: 100 * (current - base) / base
 * Returns NULL if base is NULL or 0.
 */
function pctChange(current, base) {
    return sql `
    CASE
      WHEN ${base} IS NULL OR ${base} = 0 THEN NULL
      ELSE round(100.0 * (${current} - ${base}) / ${base}, 2)
    END
  `;
}
/**
 * Builds delta metrics for a given metric field.
 * Returns base, current, delta, and pct_change for a single metric.
 */
function buildMetricDelta(currentCol, baseCol, metricName) {
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
 */
function buildDeltasFromMetrics(metrics, currentTable, baseTable) {
    return Object.assign({}, ...metrics.map((metric) => {
        const currentCol = currentTable[metric];
        const baseCol = baseTable[metric];
        return buildMetricDelta(sql `current.${currentCol}`, sql `base.${baseCol}`, metric);
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
        ...buildDeltasFromMetrics(AGG_METRICS, current, base),
        ...buildDeltasFromMetrics(APARTMENT_COMPOSITION_METRICS, current, base),
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
        ...buildDeltasFromMetrics(AGG_METRICS, current, base),
        ...buildDeltasFromMetrics(HOUSE_COMPOSITION_METRICS, current, base),
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
        ...buildDeltasFromMetrics(AGG_METRICS, current, base),
        ...buildDeltasFromMetrics(APARTMENT_COMPOSITION_METRICS, current, base),
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
        ...buildDeltasFromMetrics(AGG_METRICS, current, base),
        ...buildDeltasFromMetrics(HOUSE_COMPOSITION_METRICS, current, base),
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
