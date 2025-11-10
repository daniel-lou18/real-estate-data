import { and, between, inArray, sql } from "drizzle-orm";
import { propertySales } from "./property_sales";
import {
  MAX_APARTMENT_AREA,
  MAX_APARTMENT_PRICE,
  MIN_APARTMENT_AREA,
  MIN_APARTMENT_PRICE,
  MAX_HOUSE_AREA,
  MAX_HOUSE_PRICE,
  MIN_HOUSE_AREA,
  MIN_HOUSE_PRICE,
} from "@/repositories/constants";
import { pgMaterializedView } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

/**
 * Generates common aggregate metrics that match AggregateMetricsMV schema.
 * Takes an area column (ApartmentFloorArea or HouseFloorArea) as parameter.
 */
function buildAggregateMetrics(areaColumn: AnyPgColumn) {
  const pricePerM2 = sql`${propertySales.price} / nullif(${areaColumn}, 0)`;

  return {
    total_sales: sql<number>`count(*)::int`.as("total_sales"),
    total_price:
      sql<number>`round(coalesce(sum(${propertySales.price}), 0))::double precision`.as(
        "total_price"
      ),
    avg_price:
      sql<number>`round(coalesce(avg(${propertySales.price}), 0))::double precision`.as(
        "avg_price"
      ),
    total_area:
      sql<number>`round((coalesce(sum(${areaColumn}), 0))::double precision, 1)`.as(
        "total_area"
      ),
    avg_area:
      sql<number>`round((coalesce(avg(${areaColumn}), 0))::double precision, 1)`.as(
        "avg_area"
      ),
    avg_price_m2:
      sql<number>`round(sum(${propertySales.price}) / nullif(sum(${areaColumn}), 0))::double precision`.as(
        "avg_price_m2"
      ),
    min_price:
      sql<number>`round(min(${propertySales.price}))::double precision`.as(
        "min_price"
      ),
    max_price:
      sql<number>`round(max(${propertySales.price}))::double precision`.as(
        "max_price"
      ),
    median_price:
      sql<number>`round(percentile_cont(0.5) within group (order by ${propertySales.price}))`.as(
        "median_price"
      ),
    median_area:
      sql<number>`round((percentile_cont(0.5) within group (order by ${areaColumn}))::numeric, 1)::double precision`.as(
        "median_area"
      ),
    min_price_m2: sql<number>`round(min(${pricePerM2}))::double precision`.as(
      "min_price_m2"
    ),
    max_price_m2: sql<number>`round(max(${pricePerM2}))::double precision`.as(
      "max_price_m2"
    ),
    price_m2_p25:
      sql<number>`round(percentile_cont(0.25) within group (order by ${pricePerM2}))`.as(
        "price_m2_p25"
      ),
    price_m2_p75:
      sql<number>`round(percentile_cont(0.75) within group (order by ${pricePerM2}))`.as(
        "price_m2_p75"
      ),
    price_m2_iqr:
      sql<number>`round((percentile_cont(0.75) within group (order by ${pricePerM2})) - (percentile_cont(0.25) within group (order by ${pricePerM2})))`.as(
        "price_m2_iqr"
      ),
    price_m2_stddev:
      sql<number>`round(stddev_samp(${pricePerM2}))::double precision`.as(
        "price_m2_stddev"
      ),
  };
}

function buildApartmentComposition() {
  return {
    total_apartments:
      sql<number>`coalesce(sum(${propertySales.nbApartments}), 0)::int`.as(
        "total_apartments"
      ),
    apartment_1_room:
      sql<number>`coalesce(sum(${propertySales.nbapt1pp}), 0)::int`.as(
        "apartment_1_room"
      ),
    apartment_2_room:
      sql<number>`coalesce(sum(${propertySales.nbapt2pp}), 0)::int`.as(
        "apartment_2_room"
      ),
    apartment_3_room:
      sql<number>`coalesce(sum(${propertySales.nbapt3pp}), 0)::int`.as(
        "apartment_3_room"
      ),
    apartment_4_room:
      sql<number>`coalesce(sum(${propertySales.nbapt4pp}), 0)::int`.as(
        "apartment_4_room"
      ),
    apartment_5_room:
      sql<number>`coalesce(sum(${propertySales.nbapt5pp}), 0)::int`.as(
        "apartment_5_room"
      ),
  };
}

function buildHouseComposition() {
  return {
    total_houses:
      sql<number>`coalesce(sum(${propertySales.nbHouses}), 0)::int`.as(
        "total_houses"
      ),
    house_1_room:
      sql<number>`coalesce(sum(${propertySales.nbmai1pp}), 0)::int`.as(
        "house_1_room"
      ),
    house_2_room:
      sql<number>`coalesce(sum(${propertySales.nbmai2pp}), 0)::int`.as(
        "house_2_room"
      ),
    house_3_room:
      sql<number>`coalesce(sum(${propertySales.nbmai3pp}), 0)::int`.as(
        "house_3_room"
      ),
    house_4_room:
      sql<number>`coalesce(sum(${propertySales.nbmai4pp}), 0)::int`.as(
        "house_4_room"
      ),
    house_5_room:
      sql<number>`coalesce(sum(${propertySales.nbmai5pp}), 0)::int`.as(
        "house_5_room"
      ),
  };
}
/**
 * Builds WHERE clause for apartment filters.
 */
function buildApartmentWhereClause() {
  return and(
    inArray(propertySales.propertyTypeLabel, [
      "UN APPARTEMENT",
      "DEUX APPARTEMENTS",
      "APPARTEMENT INDETERMINE",
    ]),
    between(
      propertySales.ApartmentFloorArea,
      MIN_APARTMENT_AREA,
      MAX_APARTMENT_AREA
    ),
    between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)
  );
}

/**
 * Builds WHERE clause for house filters.
 */
function buildHouseWhereClause() {
  return and(
    inArray(propertySales.propertyTypeLabel, [
      "UNE MAISON",
      "DES MAISONS",
      "MAISON - INDETERMINEE",
    ]),
    between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA),
    between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)
  );
}

export const apartments_by_insee_code_month = pgMaterializedView(
  "apartments_by_insee_code_month"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      year: sql<number>`${propertySales.year}`.as("year"),
      month: sql<number>`${propertySales.month}`.as("month"),
      ...buildAggregateMetrics(propertySales.ApartmentFloorArea),
      ...buildApartmentComposition(),
    })
    .from(propertySales)
    .where(buildApartmentWhereClause())
    .groupBy(
      propertySales.primaryInseeCode,
      propertySales.year,
      propertySales.month
    )
);

export const houses_by_insee_code_month = pgMaterializedView(
  "houses_by_insee_code_month"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      year: sql<number>`${propertySales.year}`.as("year"),
      month: sql<number>`${propertySales.month}`.as("month"),
      ...buildAggregateMetrics(propertySales.HouseFloorArea),
      ...buildHouseComposition(),
    })
    .from(propertySales)
    .where(buildHouseWhereClause())
    .groupBy(
      propertySales.primaryInseeCode,
      propertySales.year,
      propertySales.month
    )
);

export const apartments_by_insee_code_year = pgMaterializedView(
  "apartments_by_insee_code_year"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      year: sql<number>`${propertySales.year}`.as("year"),
      ...buildAggregateMetrics(propertySales.ApartmentFloorArea),
      ...buildApartmentComposition(),
    })
    .from(propertySales)
    .where(buildApartmentWhereClause())
    .groupBy(propertySales.primaryInseeCode, propertySales.year)
);

export const houses_by_insee_code_year = pgMaterializedView(
  "houses_by_insee_code_year"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      year: sql<number>`${propertySales.year}`.as("year"),
      ...buildAggregateMetrics(propertySales.HouseFloorArea),
      ...buildHouseComposition(),
    })
    .from(propertySales)
    .where(buildHouseWhereClause())
    .groupBy(propertySales.primaryInseeCode, propertySales.year)
);

export const apartments_by_insee_code_week = pgMaterializedView(
  "apartments_by_insee_code_week"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      iso_year:
        sql<number>`extract(isoyear from ${propertySales.date})::int`.as(
          "iso_year"
        ),
      iso_week: sql<number>`extract(week from ${propertySales.date})::int`.as(
        "iso_week"
      ),
      ...buildAggregateMetrics(propertySales.ApartmentFloorArea),
      ...buildApartmentComposition(),
    })
    .from(propertySales)
    .where(buildApartmentWhereClause())
    .groupBy(
      propertySales.primaryInseeCode,
      sql`extract(isoyear from ${propertySales.date})::int`,
      sql`extract(week from ${propertySales.date})::int`
    )
);

export const houses_by_insee_code_week = pgMaterializedView(
  "houses_by_insee_code_week"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      iso_year:
        sql<number>`extract(isoyear from ${propertySales.date})::int`.as(
          "iso_year"
        ),
      iso_week: sql<number>`extract(week from ${propertySales.date})::int`.as(
        "iso_week"
      ),
      ...buildAggregateMetrics(propertySales.HouseFloorArea),
      ...buildHouseComposition(),
    })
    .from(propertySales)
    .where(buildHouseWhereClause())
    .groupBy(
      propertySales.primaryInseeCode,
      sql`extract(isoyear from ${propertySales.date})::int`,
      sql`extract(week from ${propertySales.date})::int`
    )
);

export const apartments_by_section_month = pgMaterializedView(
  "apartments_by_section_month"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      section:
        sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
          "section"
        ),
      year: sql<number>`${propertySales.year}`.as("year"),
      month: sql<number>`${propertySales.month}`.as("month"),
      ...buildAggregateMetrics(propertySales.ApartmentFloorArea),
      ...buildApartmentComposition(),
    })
    .from(propertySales)
    .where(buildApartmentWhereClause())
    .groupBy(
      sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
        "section"
      ),
      propertySales.year,
      propertySales.month
    )
);

export const houses_by_section_month = pgMaterializedView(
  "houses_by_section_month"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      section:
        sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
          "section"
        ),
      year: sql<number>`${propertySales.year}`.as("year"),
      month: sql<number>`${propertySales.month}`.as("month"),
      ...buildAggregateMetrics(propertySales.HouseFloorArea),

      ...buildHouseComposition(),
    })
    .from(propertySales)
    .where(buildHouseWhereClause())
    .groupBy(
      sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
        "section"
      ),
      propertySales.year,
      propertySales.month
    )
);

export const apartments_by_section_year = pgMaterializedView(
  "apartments_by_section_year"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      section:
        sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
          "section"
        ),
      year: sql<number>`${propertySales.year}`.as("year"),
      ...buildAggregateMetrics(propertySales.ApartmentFloorArea),
      ...buildApartmentComposition(),
    })
    .from(propertySales)
    .where(buildApartmentWhereClause())
    .groupBy(
      sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
        "section"
      ),
      propertySales.year
    )
);

export const houses_by_section_year = pgMaterializedView(
  "houses_by_section_year"
).as((qb) =>
  qb
    .select({
      inseeCode: sql<string>`${propertySales.primaryInseeCode}`.as(
        "insee_code"
      ),
      section:
        sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
          "section"
        ),
      year: sql<number>`${propertySales.year}`.as("year"),
      ...buildAggregateMetrics(propertySales.HouseFloorArea),
      ...buildHouseComposition(),
    })
    .from(propertySales)
    .where(buildHouseWhereClause())
    .groupBy(
      sql<string>`concat(${propertySales.primaryInseeCode}, "000", ${propertySales.primarySection})`.as(
        "section"
      ),
      propertySales.year
    )
);

export const aggregate_mv_indexes = {
  apts_month_keys: sql`create index if not exists idx_apts_insee_month on apartments_by_insee_code_month (insee_code, year, month)`,
  houses_month_keys: sql`create index if not exists idx_houses_insee_month on houses_by_insee_code_month (insee_code, year, month)`,
  apts_year_keys: sql`create index if not exists idx_apts_insee_year on apartments_by_insee_code_year (insee_code, year)`,
  houses_year_keys: sql`create index if not exists idx_houses_insee_year on houses_by_insee_code_year (insee_code, year)`,
  apts_week_keys: sql`create index if not exists idx_apts_insee_week on apartments_by_insee_code_week (insee_code, iso_year, iso_week)`,
  houses_week_keys: sql`create index if not exists idx_houses_insee_week on houses_by_insee_code_week (insee_code, iso_year, iso_week)`,
  apts_section_month_keys: sql`create index if not exists idx_apts_section_month on apartments_by_section_month (section, year, month)`,
  houses_section_month_keys: sql`create index if not exists idx_houses_section_month on houses_by_section_month (section, year, month)`,
  apts_section_year_keys: sql`create index if not exists idx_apts_section_year on apartments_by_section_year (section, year)`,
  houses_section_year_keys: sql`create index if not exists idx_houses_section_year on houses_by_section_year (section, year)`,
};

export const SelectApartmentsByInseeCodeMonthSchema = createSelectSchema(
  apartments_by_insee_code_month
);
export const SelectHousesByInseeCodeMonthSchema = createSelectSchema(
  houses_by_insee_code_month
);
export const SelectApartmentsByInseeCodeYearSchema = createSelectSchema(
  apartments_by_insee_code_year
);
export const SelectHousesByInseeCodeYearSchema = createSelectSchema(
  houses_by_insee_code_year
);
export const SelectApartmentsByInseeCodeWeekSchema = createSelectSchema(
  apartments_by_insee_code_week
);
export const SelectHousesByInseeCodeWeekSchema = createSelectSchema(
  houses_by_insee_code_week
);
export const SelectApartmentsBySectionMonthSchema = createSelectSchema(
  apartments_by_section_month
);
export const SelectHousesBySectionMonthSchema = createSelectSchema(
  houses_by_section_month
);
export const SelectApartmentsBySectionYearSchema = createSelectSchema(
  apartments_by_section_year
);
export const SelectHousesBySectionYearSchema = createSelectSchema(
  houses_by_section_year
);
