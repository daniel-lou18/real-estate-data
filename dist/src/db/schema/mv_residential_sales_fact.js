import { and, between, inArray, or, sql } from "drizzle-orm";
import { propertySales } from "./property_sales";
import { MAX_APARTMENT_AREA, MAX_APARTMENT_PRICE, MIN_APARTMENT_AREA, MIN_APARTMENT_PRICE, MAX_HOUSE_AREA, MAX_HOUSE_PRICE, MIN_HOUSE_AREA, MIN_HOUSE_PRICE, } from "@/repositories/constants";
import { pgMaterializedView } from "drizzle-orm/pg-core";
// Non-aggregated residential transactions (apartments + houses)
// Includes derived fields for fast listing queries: res_type, iso_year/week, area, price_per_m2, rooms_bucket
export const residential_sales_fact = pgMaterializedView("residential_sales_fact").as((qb) => qb
    .select({
    id: propertySales.id,
    idOpenData: propertySales.idopendata,
    date: propertySales.date,
    year: propertySales.year,
    month: propertySales.month,
    iso_year: sql `extract(isoyear from ${propertySales.date})::int`,
    iso_week: sql `extract(week from ${propertySales.date})::int`,
    depCode: propertySales.depCode,
    inseeCode: propertySales.primaryInseeCode,
    section: propertySales.primarySection,
    propertyTypeLabel: propertySales.propertyTypeLabel,
    res_type: sql `case
        when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
        when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
        else 'other'
      end`,
    vefa: propertySales.vefa,
    price: propertySales.price,
    area: sql `case
        when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then ${propertySales.ApartmentFloorArea}
        when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then ${propertySales.HouseFloorArea}
        else ${propertySales.floorArea}
      end`,
    price_per_m2: sql `round(${propertySales.price} / nullif(case
        when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then ${propertySales.ApartmentFloorArea}
        when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then ${propertySales.HouseFloorArea}
        else ${propertySales.floorArea}
      end, 0))`,
    // Heuristic rooms bucket per transaction: prefer largest bucket present, apartment-first then house
    rooms_bucket: sql `case
        when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then (
          case
            when coalesce(${propertySales.nbapt5pp},0) > 0 then '5+'
            when coalesce(${propertySales.nbapt4pp},0) > 0 then '4'
            when coalesce(${propertySales.nbapt3pp},0) > 0 then '3'
            when coalesce(${propertySales.nbapt2pp},0) > 0 then '2'
            when coalesce(${propertySales.nbapt1pp},0) > 0 then '1'
            else null
          end
        )
        when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then (
          case
            when coalesce(${propertySales.nbmai5pp},0) > 0 then '5+'
            when coalesce(${propertySales.nbmai4pp},0) > 0 then '4'
            when coalesce(${propertySales.nbmai3pp},0) > 0 then '3'
            when coalesce(${propertySales.nbmai2pp},0) > 0 then '2'
            when coalesce(${propertySales.nbmai1pp},0) > 0 then '1'
            else null
          end
        )
        else null
      end`,
})
    .from(propertySales)
    .where(or(
// Apartments within thresholds
and(inArray(propertySales.propertyTypeLabel, [
    "UN APPARTEMENT",
    "DEUX APPARTEMENTS",
    "APPARTEMENT INDETERMINE",
]), between(propertySales.ApartmentFloorArea, MIN_APARTMENT_AREA, MAX_APARTMENT_AREA), between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)), 
// Houses within thresholds
and(inArray(propertySales.propertyTypeLabel, [
    "UNE MAISON",
    "DES MAISONS",
    "MAISON - INDETERMINEE",
]), between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA), between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)))));
// Suggested indexes to speed up common filters on the facts MV
export const residential_sales_fact_indexes = {
    byDate: sql `create index if not exists idx_residential_sales_fact_date on residential_sales_fact (date)`,
    byYearMonth: sql `create index if not exists idx_residential_sales_fact_year_month on residential_sales_fact (year, month)`,
    byIsoYearWeek: sql `create index if not exists idx_residential_sales_fact_iso on residential_sales_fact (iso_year, iso_week)`,
    byInseeDate: sql `create index if not exists idx_residential_sales_fact_insee_date on residential_sales_fact (inseeCode, date)`,
    byDepDate: sql `create index if not exists idx_residential_sales_fact_dep_date on residential_sales_fact (depCode, date)`,
    byTypeYearMonthInsee: sql `create index if not exists idx_residential_sales_fact_type_ym_insee on residential_sales_fact (res_type, year, month, inseeCode)`,
};
// Top-K extremes (rank fields provided; clients can filter rank_asc <= K or rank_desc <= K)
export const residential_topk_by_insee_month = pgMaterializedView("residential_topk_by_insee_month").as((qb) => qb
    .select({
    id: propertySales.id,
    date: propertySales.date,
    year: propertySales.year,
    month: propertySales.month,
    depCode: propertySales.depCode,
    inseeCode: propertySales.primaryInseeCode,
    section: propertySales.primarySection,
    res_type: sql `case
        when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
        when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
        else 'other'
      end`,
    vefa: propertySales.vefa,
    price: propertySales.price,
    area: sql `coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea})`,
    price_per_m2: sql `round(${propertySales.price} / nullif(coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea}), 0))`,
    rank_asc: sql `dense_rank() over (partition by ${propertySales.primaryInseeCode}, ${propertySales.year}, ${propertySales.month},
        case
          when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
          when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
          else 'other'
        end
      order by (${propertySales.price} / nullif(coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea}), 0)) asc)`,
    rank_desc: sql `dense_rank() over (partition by ${propertySales.primaryInseeCode}, ${propertySales.year}, ${propertySales.month},
        case
          when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
          when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
          else 'other'
        end
      order by (${propertySales.price} / nullif(coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea}), 0)) desc)`,
})
    .from(propertySales)
    .where(or(and(inArray(propertySales.propertyTypeLabel, [
    "UN APPARTEMENT",
    "DEUX APPARTEMENTS",
    "APPARTEMENT INDETERMINE",
]), between(propertySales.ApartmentFloorArea, MIN_APARTMENT_AREA, MAX_APARTMENT_AREA), between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)), and(inArray(propertySales.propertyTypeLabel, [
    "UNE MAISON",
    "DES MAISONS",
    "MAISON - INDETERMINEE",
]), between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA), between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)))));
export const residential_topk_by_insee_year = pgMaterializedView("residential_topk_by_insee_year").as((qb) => qb
    .select({
    id: propertySales.id,
    date: propertySales.date,
    year: propertySales.year,
    depCode: propertySales.depCode,
    inseeCode: propertySales.primaryInseeCode,
    section: propertySales.primarySection,
    res_type: sql `case
        when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
        when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
        else 'other'
      end`,
    vefa: propertySales.vefa,
    price: propertySales.price,
    area: sql `coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea})`,
    price_per_m2: sql `round(${propertySales.price} / nullif(coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea}), 0))`,
    rank_asc: sql `dense_rank() over (partition by ${propertySales.primaryInseeCode}, ${propertySales.year},
        case
          when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
          when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
          else 'other'
        end
      order by (${propertySales.price} / nullif(coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea}), 0)) asc)`,
    rank_desc: sql `dense_rank() over (partition by ${propertySales.primaryInseeCode}, ${propertySales.year},
        case
          when ${propertySales.propertyTypeLabel} in ('UN APPARTEMENT','DEUX APPARTEMENTS','APPARTEMENT INDETERMINE') then 'apartment'
          when ${propertySales.propertyTypeLabel} in ('UNE MAISON','DES MAISONS','MAISON - INDETERMINEE') then 'house'
          else 'other'
        end
      order by (${propertySales.price} / nullif(coalesce(${propertySales.ApartmentFloorArea}, ${propertySales.HouseFloorArea}), 0)) desc)`,
})
    .from(propertySales)
    .where(or(and(inArray(propertySales.propertyTypeLabel, [
    "UN APPARTEMENT",
    "DEUX APPARTEMENTS",
    "APPARTEMENT INDETERMINE",
]), between(propertySales.ApartmentFloorArea, MIN_APARTMENT_AREA, MAX_APARTMENT_AREA), between(propertySales.price, MIN_APARTMENT_PRICE, MAX_APARTMENT_PRICE)), and(inArray(propertySales.propertyTypeLabel, [
    "UNE MAISON",
    "DES MAISONS",
    "MAISON - INDETERMINEE",
]), between(propertySales.HouseFloorArea, MIN_HOUSE_AREA, MAX_HOUSE_AREA), between(propertySales.price, MIN_HOUSE_PRICE, MAX_HOUSE_PRICE)))));
export const residential_topk_indexes = {
    month_byKeys: sql `create index if not exists idx_res_topk_month_keys on residential_topk_by_insee_month (inseeCode, year, month, res_type)`,
    year_byKeys: sql `create index if not exists idx_res_topk_year_keys on residential_topk_by_insee_year (inseeCode, year, res_type)`,
    month_byPriceM2: sql `create index if not exists idx_res_topk_month_price_m2 on residential_topk_by_insee_month (price_per_m2)`,
    year_byPriceM2: sql `create index if not exists idx_res_topk_year_price_m2 on residential_topk_by_insee_year (price_per_m2)`,
};
