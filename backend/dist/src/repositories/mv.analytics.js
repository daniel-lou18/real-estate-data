import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { apartments_by_insee_code_month, houses_by_insee_code_month, apartments_by_insee_code_year, houses_by_insee_code_year, apartments_by_insee_code_week, houses_by_insee_code_week, } from "@/db/schema/mv_property_sales";
// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function getOrderByForMonth(view, sortBy, sortOrder) {
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
function getOrderByForYear(view, sortBy, sortOrder) {
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
function getOrderByForWeek(view, sortBy, sortOrder) {
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
// ----------------------------------------------------------------------------
// Repositories: Monthly (INSEE × year × month)
// ----------------------------------------------------------------------------
export async function getAptsByInseeMonth(params) {
    const whereConditions = [];
    if (params.inseeCode)
        whereConditions.push(eq(apartments_by_insee_code_month.inseeCode, params.inseeCode));
    if (params.year)
        whereConditions.push(eq(apartments_by_insee_code_month.year, params.year));
    if (params.month)
        whereConditions.push(eq(apartments_by_insee_code_month.month, params.month));
    const orderBy = getOrderByForMonth(apartments_by_insee_code_month, params.sortBy ?? "total_sales", params.sortOrder ?? "desc");
    const results = await db
        .select()
        .from(apartments_by_insee_code_month)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
export async function getHousesByInseeMonth(params) {
    const whereConditions = [];
    if (params.inseeCode)
        whereConditions.push(eq(houses_by_insee_code_month.inseeCode, params.inseeCode));
    if (params.year)
        whereConditions.push(eq(houses_by_insee_code_month.year, params.year));
    if (params.month)
        whereConditions.push(eq(houses_by_insee_code_month.month, params.month));
    const orderBy = getOrderByForMonth(houses_by_insee_code_month, params.sortBy ?? "total_sales", params.sortOrder ?? "desc");
    const results = await db
        .select()
        .from(houses_by_insee_code_month)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
// ----------------------------------------------------------------------------
// Repositories: Yearly (INSEE × year)
// ----------------------------------------------------------------------------
export async function getAptsByInseeYear(params) {
    const whereConditions = [];
    if (params.inseeCode)
        whereConditions.push(eq(apartments_by_insee_code_year.inseeCode, params.inseeCode));
    if (params.year)
        whereConditions.push(eq(apartments_by_insee_code_year.year, params.year));
    const orderBy = getOrderByForYear(apartments_by_insee_code_year, params.sortBy ?? "total_sales", params.sortOrder ?? "desc");
    const results = await db
        .select()
        .from(apartments_by_insee_code_year)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
export async function getHousesByInseeYear(params) {
    const whereConditions = [];
    if (params.inseeCode)
        whereConditions.push(eq(houses_by_insee_code_year.inseeCode, params.inseeCode));
    if (params.year)
        whereConditions.push(eq(houses_by_insee_code_year.year, params.year));
    const orderBy = getOrderByForYear(houses_by_insee_code_year, params.sortBy ?? "total_sales", params.sortOrder ?? "desc");
    const results = await db
        .select()
        .from(houses_by_insee_code_year)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
// ----------------------------------------------------------------------------
// Repositories: Weekly (INSEE × ISO year × ISO week)
// ----------------------------------------------------------------------------
export async function getAptsByInseeWeek(params) {
    const whereConditions = [];
    if (params.inseeCode)
        whereConditions.push(eq(apartments_by_insee_code_week.inseeCode, params.inseeCode));
    if (params.iso_year)
        whereConditions.push(eq(apartments_by_insee_code_week.iso_year, params.iso_year));
    if (params.iso_week)
        whereConditions.push(eq(apartments_by_insee_code_week.iso_week, params.iso_week));
    const orderBy = getOrderByForWeek(apartments_by_insee_code_week, params.sortBy ?? "total_sales", params.sortOrder ?? "desc");
    const results = await db
        .select()
        .from(apartments_by_insee_code_week)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
export async function getHousesByInseeWeek(params) {
    const whereConditions = [];
    if (params.inseeCode)
        whereConditions.push(eq(houses_by_insee_code_week.inseeCode, params.inseeCode));
    if (params.iso_year)
        whereConditions.push(eq(houses_by_insee_code_week.iso_year, params.iso_year));
    if (params.iso_week)
        whereConditions.push(eq(houses_by_insee_code_week.iso_week, params.iso_week));
    const orderBy = getOrderByForWeek(houses_by_insee_code_week, params.sortBy ?? "total_sales", params.sortOrder ?? "desc");
    const results = await db
        .select()
        .from(houses_by_insee_code_week)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
