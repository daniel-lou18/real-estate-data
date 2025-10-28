import { and, between, inArray, sql } from "drizzle-orm";
import { propertySales } from "./property_sales";
import { MAX_APARTMENT_AREA, MAX_APARTMENT_PRICE, MIN_APARTMENT_AREA, MIN_APARTMENT_PRICE, MAX_HOUSE_AREA, MAX_HOUSE_PRICE, MIN_HOUSE_AREA, MIN_HOUSE_PRICE, } from "@/repositories/constants";
import { pgMaterializedView } from "drizzle-orm/pg-core";
export const apartments_by_insee_code_month = pgMaterializedView("apartments_by_insee_code_month").as((qb) => qb
    .select({
    inseeCode: propertySales.primaryInseeCode,
    year: propertySales.year,
    month: propertySales.month,
    total_sales: sql `count(*)::int`,
    total_price: sql `round(coalesce(sum(${propertySales.price}), 0))`,
    avg_price: sql `round(coalesce(avg(${propertySales.price}), 0))`,
    total_area: sql `round(coalesce(sum(${propertySales.ApartmentFloorArea}), 0), 1)`,
    avg_area: sql `round(coalesce(avg(${propertySales.ApartmentFloorArea}), 0), 1)`,
    avg_price_m2: sql `round(sum(${propertySales.price}) / nullif(sum(${propertySales.ApartmentFloorArea}), 0))`,
    total_apartments: sql `coalesce(sum(${propertySales.nbApartments}), 0)::int`,
    apartment_1_room: sql `coalesce(sum(${propertySales.nbapt1pp}), 0)::int`,
    apartment_2_room: sql `coalesce(sum(${propertySales.nbapt2pp}), 0)::int`,
    apartment_3_room: sql `coalesce(sum(${propertySales.nbapt3pp}), 0)::int`,
    apartment_4_room: sql `coalesce(sum(${propertySales.nbapt4pp}), 0)::int`,
    apartment_5_room: sql `coalesce(sum(${propertySales.nbapt5pp}), 0)::int`,
    price_m2_deciles: sql `jsonb_build_array(
        round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))
      )`,
    min_price: sql `round(min(${propertySales.price}))`,
    max_price: sql `round(max(${propertySales.price}))`,
    median_price: sql `round(percentile_cont(0.5) within group (order by ${propertySales.price}))`,
    median_area: sql `round(percentile_cont(0.5) within group (order by ${propertySales.ApartmentFloorArea}), 1)`,
    min_price_m2: sql `round(min(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    max_price_m2: sql `round(max(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_p25: sql `round(percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_p75: sql `round(percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_iqr: sql `round((percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))) - (percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))))`,
    price_m2_stddev: sql `round(stddev_samp(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
})
    .from(propertySales)
    .where(and(inArray(propertySales.propertyTypeLabel, [
    "UN APPARTEMENT",
    "DEUX APPARTEMENTS",
    "APPARTEMENT INDETERMINE",
]), between(propertySales.ApartmentFloorArea, MIN_APARTMENT_AREA, MAX_APARTMENT_AREA), between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)))
    .groupBy(propertySales.primaryInseeCode, propertySales.year, propertySales.month));
export const houses_by_insee_code_month = pgMaterializedView("houses_by_insee_code_month").as((qb) => qb
    .select({
    inseeCode: propertySales.primaryInseeCode,
    year: propertySales.year,
    month: propertySales.month,
    total_sales: sql `count(*)::int`,
    total_price: sql `round(coalesce(sum(${propertySales.price}), 0))`,
    avg_price: sql `round(coalesce(avg(${propertySales.price}), 0))`,
    total_area: sql `round(coalesce(sum(${propertySales.HouseFloorArea}), 0), 1)`,
    avg_area: sql `round(coalesce(avg(${propertySales.HouseFloorArea}), 0), 1)`,
    avg_price_m2: sql `round(sum(${propertySales.price}) / nullif(sum(${propertySales.HouseFloorArea}), 0))`,
    total_houses: sql `coalesce(sum(${propertySales.nbHouses}), 0)::int`,
    house_1_room: sql `coalesce(sum(${propertySales.nbmai1pp}), 0)::int`,
    house_2_room: sql `coalesce(sum(${propertySales.nbmai2pp}), 0)::int`,
    house_3_room: sql `coalesce(sum(${propertySales.nbmai3pp}), 0)::int`,
    house_4_room: sql `coalesce(sum(${propertySales.nbmai4pp}), 0)::int`,
    house_5_room: sql `coalesce(sum(${propertySales.nbmai5pp}), 0)::int`,
    price_m2_deciles: sql `jsonb_build_array(
        round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))
      )`,
    min_price: sql `round(min(${propertySales.price}))`,
    max_price: sql `round(max(${propertySales.price}))`,
    median_price: sql `round(percentile_cont(0.5) within group (order by ${propertySales.price}))`,
    median_area: sql `round(percentile_cont(0.5) within group (order by ${propertySales.HouseFloorArea}), 1)`,
    min_price_m2: sql `round(min(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    max_price_m2: sql `round(max(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_p25: sql `round(percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_p75: sql `round(percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_iqr: sql `round((percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))) - (percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))))`,
    price_m2_stddev: sql `round(stddev_samp(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
})
    .from(propertySales)
    .where(and(inArray(propertySales.propertyTypeLabel, [
    "UNE MAISON",
    "DES MAISONS",
    "MAISON - INDETERMINEE",
]), between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA), between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)))
    .groupBy(propertySales.primaryInseeCode, propertySales.year, propertySales.month));
export const apartments_by_insee_code_year = pgMaterializedView("apartments_by_insee_code_year").as((qb) => qb
    .select({
    inseeCode: propertySales.primaryInseeCode,
    year: propertySales.year,
    total_sales: sql `count(*)::int`,
    total_price: sql `round(coalesce(sum(${propertySales.price}), 0))`,
    avg_price: sql `round(coalesce(avg(${propertySales.price}), 0))`,
    total_area: sql `round(coalesce(sum(${propertySales.ApartmentFloorArea}), 0), 1)`,
    avg_area: sql `round(coalesce(avg(${propertySales.ApartmentFloorArea}), 0), 1)`,
    avg_price_m2: sql `round(sum(${propertySales.price}) / nullif(sum(${propertySales.ApartmentFloorArea}), 0))`,
    total_apartments: sql `coalesce(sum(${propertySales.nbApartments}), 0)::int`,
    apartment_1_room: sql `coalesce(sum(${propertySales.nbapt1pp}), 0)::int`,
    apartment_2_room: sql `coalesce(sum(${propertySales.nbapt2pp}), 0)::int`,
    apartment_3_room: sql `coalesce(sum(${propertySales.nbapt3pp}), 0)::int`,
    apartment_4_room: sql `coalesce(sum(${propertySales.nbapt4pp}), 0)::int`,
    apartment_5_room: sql `coalesce(sum(${propertySales.nbapt5pp}), 0)::int`,
    price_m2_deciles: sql `jsonb_build_array(
        round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))
      )`,
    min_price: sql `round(min(${propertySales.price}))`,
    max_price: sql `round(max(${propertySales.price}))`,
    median_price: sql `round(percentile_cont(0.5) within group (order by ${propertySales.price}))`,
    median_area: sql `round(percentile_cont(0.5) within group (order by ${propertySales.ApartmentFloorArea}), 1)`,
    min_price_m2: sql `round(min(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    max_price_m2: sql `round(max(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_p25: sql `round(percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_p75: sql `round(percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_iqr: sql `round((percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))) - (percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))))`,
    price_m2_stddev: sql `round(stddev_samp(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
})
    .from(propertySales)
    .where(and(inArray(propertySales.propertyTypeLabel, [
    "UN APPARTEMENT",
    "DEUX APPARTEMENTS",
    "APPARTEMENT INDETERMINE",
]), between(propertySales.ApartmentFloorArea, MIN_APARTMENT_AREA, MAX_APARTMENT_AREA), between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)))
    .groupBy(propertySales.primaryInseeCode, propertySales.year));
export const houses_by_insee_code_year = pgMaterializedView("houses_by_insee_code_year").as((qb) => qb
    .select({
    inseeCode: propertySales.primaryInseeCode,
    year: propertySales.year,
    total_sales: sql `count(*)::int`,
    total_price: sql `round(coalesce(sum(${propertySales.price}), 0))`,
    avg_price: sql `round(coalesce(avg(${propertySales.price}), 0))`,
    total_area: sql `round(coalesce(sum(${propertySales.HouseFloorArea}), 0), 1)`,
    avg_area: sql `round(coalesce(avg(${propertySales.HouseFloorArea}), 0), 1)`,
    avg_price_m2: sql `round(sum(${propertySales.price}) / nullif(sum(${propertySales.HouseFloorArea}), 0))`,
    total_houses: sql `coalesce(sum(${propertySales.nbHouses}), 0)::int`,
    house_1_room: sql `coalesce(sum(${propertySales.nbmai1pp}), 0)::int`,
    house_2_room: sql `coalesce(sum(${propertySales.nbmai2pp}), 0)::int`,
    house_3_room: sql `coalesce(sum(${propertySales.nbmai3pp}), 0)::int`,
    house_4_room: sql `coalesce(sum(${propertySales.nbmai4pp}), 0)::int`,
    house_5_room: sql `coalesce(sum(${propertySales.nbmai5pp}), 0)::int`,
    price_m2_deciles: sql `jsonb_build_array(
        round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))
      )`,
    min_price: sql `round(min(${propertySales.price}))`,
    max_price: sql `round(max(${propertySales.price}))`,
    median_price: sql `round(percentile_cont(0.5) within group (order by ${propertySales.price}))`,
    median_area: sql `round(percentile_cont(0.5) within group (order by ${propertySales.HouseFloorArea}), 1)`,
    min_price_m2: sql `round(min(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    max_price_m2: sql `round(max(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_p25: sql `round(percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_p75: sql `round(percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_iqr: sql `round((percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))) - (percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))))`,
    price_m2_stddev: sql `round(stddev_samp(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
})
    .from(propertySales)
    .where(and(inArray(propertySales.propertyTypeLabel, [
    "UNE MAISON",
    "DES MAISONS",
    "MAISON - INDETERMINEE",
]), between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA), between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)))
    .groupBy(propertySales.primaryInseeCode, propertySales.year));
export const apartments_by_insee_code_week = pgMaterializedView("apartments_by_insee_code_week").as((qb) => qb
    .select({
    inseeCode: propertySales.primaryInseeCode,
    iso_year: sql `extract(isoyear from ${propertySales.date})::int`,
    iso_week: sql `extract(week from ${propertySales.date})::int`,
    total_sales: sql `count(*)::int`,
    total_price: sql `round(coalesce(sum(${propertySales.price}), 0))`,
    avg_price: sql `round(coalesce(avg(${propertySales.price}), 0))`,
    total_area: sql `round(coalesce(sum(${propertySales.ApartmentFloorArea}), 0), 1)`,
    avg_area: sql `round(coalesce(avg(${propertySales.ApartmentFloorArea}), 0), 1)`,
    avg_price_m2: sql `round(sum(${propertySales.price}) / nullif(sum(${propertySales.ApartmentFloorArea}), 0))`,
    total_apartments: sql `coalesce(sum(${propertySales.nbApartments}), 0)::int`,
    apartment_1_room: sql `coalesce(sum(${propertySales.nbapt1pp}), 0)::int`,
    apartment_2_room: sql `coalesce(sum(${propertySales.nbapt2pp}), 0)::int`,
    apartment_3_room: sql `coalesce(sum(${propertySales.nbapt3pp}), 0)::int`,
    apartment_4_room: sql `coalesce(sum(${propertySales.nbapt4pp}), 0)::int`,
    apartment_5_room: sql `coalesce(sum(${propertySales.nbapt5pp}), 0)::int`,
    price_m2_deciles: sql `jsonb_build_array(
        round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))),
        round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))
      )`,
    min_price: sql `round(min(${propertySales.price}))`,
    max_price: sql `round(max(${propertySales.price}))`,
    median_price: sql `round(percentile_cont(0.5) within group (order by ${propertySales.price}))`,
    median_area: sql `round(percentile_cont(0.5) within group (order by ${propertySales.ApartmentFloorArea}), 1)`,
    min_price_m2: sql `round(min(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    max_price_m2: sql `round(max(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_p25: sql `round(percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_p75: sql `round(percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
    price_m2_iqr: sql `round((percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))) - (percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0))))`,
    price_m2_stddev: sql `round(stddev_samp(${propertySales.price} / nullif(${propertySales.ApartmentFloorArea}, 0)))`,
})
    .from(propertySales)
    .where(and(inArray(propertySales.propertyTypeLabel, [
    "UN APPARTEMENT",
    "DEUX APPARTEMENTS",
    "APPARTEMENT INDETERMINE",
]), between(propertySales.ApartmentFloorArea, MIN_APARTMENT_AREA, MAX_APARTMENT_AREA), between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)))
    .groupBy(propertySales.primaryInseeCode, sql `extract(isoyear from ${propertySales.date})::int`, sql `extract(week from ${propertySales.date})::int`));
export const houses_by_insee_code_week = pgMaterializedView("houses_by_insee_code_week").as((qb) => qb
    .select({
    inseeCode: propertySales.primaryInseeCode,
    iso_year: sql `extract(isoyear from ${propertySales.date})::int`,
    iso_week: sql `extract(week from ${propertySales.date})::int`,
    total_sales: sql `count(*)::int`,
    total_price: sql `round(coalesce(sum(${propertySales.price}), 0))`,
    avg_price: sql `round(coalesce(avg(${propertySales.price}), 0))`,
    total_area: sql `round(coalesce(sum(${propertySales.HouseFloorArea}), 0), 1)`,
    avg_area: sql `round(coalesce(avg(${propertySales.HouseFloorArea}), 0), 1)`,
    avg_price_m2: sql `round(sum(${propertySales.price}) / nullif(sum(${propertySales.HouseFloorArea}), 0))`,
    total_houses: sql `coalesce(sum(${propertySales.nbHouses}), 0)::int`,
    house_1_room: sql `coalesce(sum(${propertySales.nbmai1pp}), 0)::int`,
    house_2_room: sql `coalesce(sum(${propertySales.nbmai2pp}), 0)::int`,
    house_3_room: sql `coalesce(sum(${propertySales.nbmai3pp}), 0)::int`,
    house_4_room: sql `coalesce(sum(${propertySales.nbmai4pp}), 0)::int`,
    house_5_room: sql `coalesce(sum(${propertySales.nbmai5pp}), 0)::int`,
    price_m2_deciles: sql `jsonb_build_array(
        round(percentile_cont(0.1) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.2) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.3) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.4) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.5) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.6) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.7) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.8) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(0.9) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))),
        round(percentile_cont(1.0) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))
      )`,
    min_price: sql `round(min(${propertySales.price}))`,
    max_price: sql `round(max(${propertySales.price}))`,
    median_price: sql `round(percentile_cont(0.5) within group (order by ${propertySales.price}))`,
    median_area: sql `round(percentile_cont(0.5) within group (order by ${propertySales.HouseFloorArea}), 1)`,
    min_price_m2: sql `round(min(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    max_price_m2: sql `round(max(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_p25: sql `round(percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_p75: sql `round(percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
    price_m2_iqr: sql `round((percentile_cont(0.75) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))) - (percentile_cont(0.25) within group (order by ${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0))))`,
    price_m2_stddev: sql `round(stddev_samp(${propertySales.price} / nullif(${propertySales.HouseFloorArea}, 0)))`,
})
    .from(propertySales)
    .where(and(inArray(propertySales.propertyTypeLabel, [
    "UNE MAISON",
    "DES MAISONS",
    "MAISON - INDETERMINEE",
]), between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA), between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)))
    .groupBy(propertySales.primaryInseeCode, sql `extract(isoyear from ${propertySales.date})::int`, sql `extract(week from ${propertySales.date})::int`));
export const aggregate_mv_indexes = {
    // Monthly
    apts_month_keys: sql `create index if not exists idx_apts_insee_month on apartments_by_insee_code_month (inseeCode, year, month)`,
    houses_month_keys: sql `create index if not exists idx_houses_insee_month on houses_by_insee_code_month (inseeCode, year, month)`,
    // Yearly
    apts_year_keys: sql `create index if not exists idx_apts_insee_year on apartments_by_insee_code_year (inseeCode, year)`,
    houses_year_keys: sql `create index if not exists idx_houses_insee_year on houses_by_insee_code_year (inseeCode, year)`,
    // Weekly
    apts_week_keys: sql `create index if not exists idx_apts_insee_week on apartments_by_insee_code_week (inseeCode, iso_year, iso_week)`,
    houses_week_keys: sql `create index if not exists idx_houses_insee_week on houses_by_insee_code_week (inseeCode, iso_year, iso_week)`,
};
