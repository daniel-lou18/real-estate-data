import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  apartments_by_insee_code_month,
  houses_by_insee_code_month,
  apartments_by_insee_code_year,
  houses_by_insee_code_year,
  apartments_by_insee_code_week,
  houses_by_insee_code_week,
} from "@/db/schema/mv_property_sales";
import type {
  ApartmentsByInseeMonth,
  HousesByInseeMonth,
  ApartmentsByInseeYear,
  HousesByInseeYear,
  ApartmentsByInseeWeek,
  HousesByInseeWeek,
  InseeMonthParams,
  InseeYearParams,
  InseeWeekParams,
  SortBy,
  SortOrder,
} from "@/routes/sales/mv/mv.schemas";

/**
 * Generic orderBy helper that works for all views.
 * All views have the same sortable fields: total_sales, avg_price_m2, total_price, avg_price
 */
function getOrderBy<
  T extends {
    total_sales: any;
    avg_price_m2: any;
    total_price: any;
    avg_price: any;
  }
>(view: T, sortBy: SortBy | undefined, sortOrder: SortOrder) {
  const dir = sortOrder === "asc" ? asc : desc;
  switch (sortBy) {
    case "avg_price_m2":
      return dir(view.avg_price_m2);
    case "total_price":
      return dir(view.total_price);
    case "avg_price":
      return dir(view.avg_price);
    case "total_sales":
    default:
      return dir(view.total_sales);
  }
}

function buildMonthWhereConditions(
  view:
    | typeof apartments_by_insee_code_month
    | typeof houses_by_insee_code_month,
  params: InseeMonthParams
) {
  const conditions = [];
  if (params.inseeCode) conditions.push(eq(view.inseeCode, params.inseeCode));
  if (params.year) conditions.push(eq(view.year, params.year));
  if (params.month) conditions.push(eq(view.month, params.month));
  return conditions;
}

function buildYearWhereConditions(
  view: typeof apartments_by_insee_code_year | typeof houses_by_insee_code_year,
  params: InseeYearParams
) {
  const conditions = [];
  if (params.inseeCode) conditions.push(eq(view.inseeCode, params.inseeCode));
  if (params.year) conditions.push(eq(view.year, params.year));
  return conditions;
}

function buildWeekWhereConditions(
  view: typeof apartments_by_insee_code_week | typeof houses_by_insee_code_week,
  params: InseeWeekParams
) {
  const conditions = [];
  if (params.inseeCode) conditions.push(eq(view.inseeCode, params.inseeCode));
  if (params.iso_year) conditions.push(eq(view.iso_year, params.iso_year));
  if (params.iso_week) conditions.push(eq(view.iso_week, params.iso_week));
  return conditions;
}

// ----------------------------------------------------------------------------
// Repositories: Monthly (INSEE × year × month)
// ----------------------------------------------------------------------------

export async function getAptsByInseeMonth(
  params: InseeMonthParams
): Promise<ApartmentsByInseeMonth[]> {
  const whereConditions = buildMonthWhereConditions(
    apartments_by_insee_code_month,
    params
  );

  const orderBy = getOrderBy(
    apartments_by_insee_code_month,
    params.sortBy ?? "total_sales",
    params.sortOrder ?? "desc"
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_month)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as ApartmentsByInseeMonth[];
}

export async function getHousesByInseeMonth(
  params: InseeMonthParams
): Promise<HousesByInseeMonth[]> {
  const whereConditions = buildMonthWhereConditions(
    houses_by_insee_code_month,
    params
  );

  const orderBy = getOrderBy(
    houses_by_insee_code_month,
    params.sortBy ?? "total_sales",
    params.sortOrder ?? "desc"
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_month)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as HousesByInseeMonth[];
}

// ----------------------------------------------------------------------------
// Repositories: Yearly (INSEE × year)
// ----------------------------------------------------------------------------

export async function getAptsByInseeYear(
  params: InseeYearParams
): Promise<ApartmentsByInseeYear[]> {
  const whereConditions = buildYearWhereConditions(
    apartments_by_insee_code_year,
    params
  );

  const orderBy = getOrderBy(
    apartments_by_insee_code_year,
    params.sortBy ?? "total_sales",
    params.sortOrder ?? "desc"
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_year)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as ApartmentsByInseeYear[];
}

export async function getHousesByInseeYear(
  params: InseeYearParams
): Promise<HousesByInseeYear[]> {
  const whereConditions = buildYearWhereConditions(
    houses_by_insee_code_year,
    params
  );

  const orderBy = getOrderBy(
    houses_by_insee_code_year,
    params.sortBy ?? "total_sales",
    params.sortOrder ?? "desc"
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_year)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as HousesByInseeYear[];
}

// ----------------------------------------------------------------------------
// Repositories: Weekly (INSEE × ISO year × ISO week)
// ----------------------------------------------------------------------------

export async function getAptsByInseeWeek(
  params: InseeWeekParams
): Promise<ApartmentsByInseeWeek[]> {
  const whereConditions = buildWeekWhereConditions(
    apartments_by_insee_code_week,
    params
  );

  const orderBy = getOrderBy(
    apartments_by_insee_code_week,
    params.sortBy ?? "total_sales",
    params.sortOrder ?? "desc"
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_week)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as ApartmentsByInseeWeek[];
}

export async function getHousesByInseeWeek(
  params: InseeWeekParams
): Promise<HousesByInseeWeek[]> {
  const whereConditions = buildWeekWhereConditions(
    houses_by_insee_code_week,
    params
  );

  const orderBy = getOrderBy(
    houses_by_insee_code_week,
    params.sortBy ?? "total_sales",
    params.sortOrder ?? "desc"
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_week)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as HousesByInseeWeek[];
}
