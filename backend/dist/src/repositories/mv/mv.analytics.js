import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { apartments_by_insee_code_month, houses_by_insee_code_month, apartments_by_insee_code_year, houses_by_insee_code_year, apartments_by_insee_code_week, houses_by_insee_code_week, apartments_by_section_month, houses_by_section_month, apartments_by_section_year, houses_by_section_year, } from "@/db/schema/mv_property_sales";
/**
 * Generic orderBy helper that works for all views.
 * Returns an array of sort expressions for multi-field sorting.
 * All views share common metric fields and dimensional fields (inseeCode, year)
 * Some views have additional temporal fields (month, iso_year, iso_week)
 *
 * For temporal sorts, automatically adds secondary sorts for natural ordering:
 * - year → year, month (if month exists)
 * - iso_year → iso_year, iso_week (if iso_week exists)
 */
function getOrderBy(view, sortBy, sortOrder) {
    const dir = sortOrder === "asc" ? asc : desc;
    switch (sortBy) {
        // Dimensional fields
        case "inseeCode":
            return view.inseeCode ? [dir(view.inseeCode)] : [dir(view.total_sales)];
        case "section":
            return view.section ? [dir(view.section)] : [dir(view.total_sales)];
        // Temporal fields with automatic secondary sorts
        case "year":
            if (view.year && view.month) {
                // For monthly data: sort by year, then month
                return [dir(view.year), dir(view.month)];
            }
            else if (view.year) {
                return [dir(view.year)];
            }
            return [dir(view.total_sales)];
        case "month":
            if (view.month && view.year) {
                // Sort by month, but also by year for proper ordering across years
                return [dir(view.year), dir(view.month)];
            }
            else if (view.month) {
                return [dir(view.month)];
            }
            return [dir(view.total_sales)];
        case "iso_year":
            if (view.iso_year && view.iso_week) {
                // For weekly data: sort by iso_year, then iso_week
                return [dir(view.iso_year), dir(view.iso_week)];
            }
            else if (view.iso_year) {
                return [dir(view.iso_year)];
            }
            return [dir(view.total_sales)];
        case "iso_week":
            if (view.iso_week && view.iso_year) {
                // Sort by iso_week, but also by iso_year for proper ordering across years
                return [dir(view.iso_year), dir(view.iso_week)];
            }
            else if (view.iso_week) {
                return [dir(view.iso_week)];
            }
            return [dir(view.total_sales)];
        // Metric fields
        case "avg_price_m2":
            return [dir(view.avg_price_m2)];
        case "total_price":
            return [dir(view.total_price)];
        case "avg_price":
            return [dir(view.avg_price)];
        case "total_sales":
        default:
            return [dir(view.total_sales)];
    }
}
function buildMonthWhereConditions(view, params) {
    const conditions = [];
    if (params.inseeCode)
        conditions.push(eq(view.inseeCode, params.inseeCode));
    if (params.year)
        conditions.push(eq(view.year, params.year));
    if (params.month)
        conditions.push(eq(view.month, params.month));
    return conditions;
}
function buildYearWhereConditions(view, params) {
    const conditions = [];
    if (params.inseeCode)
        conditions.push(eq(view.inseeCode, params.inseeCode));
    if (params.year)
        conditions.push(eq(view.year, params.year));
    return conditions;
}
function buildWeekWhereConditions(view, params) {
    const conditions = [];
    if (params.inseeCode)
        conditions.push(eq(view.inseeCode, params.inseeCode));
    if (params.iso_year)
        conditions.push(eq(view.iso_year, params.iso_year));
    if (params.iso_week)
        conditions.push(eq(view.iso_week, params.iso_week));
    return conditions;
}
function buildSectionMonthWhereConditions(view, params) {
    const conditions = [];
    if (params.inseeCode)
        conditions.push(eq(view.inseeCode, params.inseeCode));
    if (params.section)
        conditions.push(eq(view.section, params.section));
    if (params.year)
        conditions.push(eq(view.year, params.year));
    if (params.month)
        conditions.push(eq(view.month, params.month));
    return conditions;
}
function buildSectionYearWhereConditions(view, params) {
    const conditions = [];
    if (params.inseeCode)
        conditions.push(eq(view.inseeCode, params.inseeCode));
    if (params.section)
        conditions.push(eq(view.section, params.section));
    if (params.year)
        conditions.push(eq(view.year, params.year));
    return conditions;
}
// ----------------------------------------------------------------------------
// Repositories: Monthly (INSEE × year × month)
// ----------------------------------------------------------------------------
export async function getAptsByInseeMonth(params) {
    const whereConditions = buildMonthWhereConditions(apartments_by_insee_code_month, params);
    const orderBy = getOrderBy(apartments_by_insee_code_month, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(apartments_by_insee_code_month)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
export async function getHousesByInseeMonth(params) {
    const whereConditions = buildMonthWhereConditions(houses_by_insee_code_month, params);
    const orderBy = getOrderBy(houses_by_insee_code_month, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(houses_by_insee_code_month)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
// ----------------------------------------------------------------------------
// Repositories: Yearly (INSEE × year)
// ----------------------------------------------------------------------------
export async function getAptsByInseeYear(params) {
    const whereConditions = buildYearWhereConditions(apartments_by_insee_code_year, params);
    const orderBy = getOrderBy(apartments_by_insee_code_year, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(apartments_by_insee_code_year)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
export async function getHousesByInseeYear(params) {
    const whereConditions = buildYearWhereConditions(houses_by_insee_code_year, params);
    const orderBy = getOrderBy(houses_by_insee_code_year, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(houses_by_insee_code_year)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
// ----------------------------------------------------------------------------
// Repositories: Weekly (INSEE × ISO year × ISO week)
// ----------------------------------------------------------------------------
export async function getAptsByInseeWeek(params) {
    const whereConditions = buildWeekWhereConditions(apartments_by_insee_code_week, params);
    const orderBy = getOrderBy(apartments_by_insee_code_week, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(apartments_by_insee_code_week)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
export async function getHousesByInseeWeek(params) {
    const whereConditions = buildWeekWhereConditions(houses_by_insee_code_week, params);
    const orderBy = getOrderBy(houses_by_insee_code_week, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(houses_by_insee_code_week)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit ?? 200)
        .offset(params.offset ?? 0);
    return results;
}
// ----------------------------------------------------------------------------
// Repositories: Monthly (SECTION × year × month)
// ----------------------------------------------------------------------------
export async function getAptsBySectionMonth(params) {
    const whereConditions = buildSectionMonthWhereConditions(apartments_by_section_month, params);
    const orderBy = getOrderBy(apartments_by_section_month, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(apartments_by_section_month)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit)
        .offset(params.offset);
    return results;
}
export async function getHousesBySectionMonth(params) {
    const whereConditions = buildSectionMonthWhereConditions(houses_by_section_month, params);
    const orderBy = getOrderBy(houses_by_section_month, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(houses_by_section_month)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit)
        .offset(params.offset);
    return results;
}
// ----------------------------------------------------------------------------
// Repositories: Yearly (SECTION × year)
// ----------------------------------------------------------------------------
export async function getAptsBySectionYear(params) {
    const whereConditions = buildSectionYearWhereConditions(apartments_by_section_year, params);
    const orderBy = getOrderBy(apartments_by_section_year, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(apartments_by_section_year)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit)
        .offset(params.offset);
    return results;
}
export async function getHousesBySectionYear(params) {
    const whereConditions = buildSectionYearWhereConditions(houses_by_section_year, params);
    const orderBy = getOrderBy(houses_by_section_year, params.sortBy, params.sortOrder);
    const results = await db
        .select()
        .from(houses_by_section_year)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(...orderBy)
        .limit(params.limit)
        .offset(params.offset);
    return results;
}
