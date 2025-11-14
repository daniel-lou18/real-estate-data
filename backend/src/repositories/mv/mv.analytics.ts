import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  apartments_by_insee_code_month,
  houses_by_insee_code_month,
  apartments_by_insee_code_year,
  houses_by_insee_code_year,
  apartments_by_insee_code_week,
  houses_by_insee_code_week,
  apartments_by_section_month,
  houses_by_section_month,
  apartments_by_section_year,
  houses_by_section_year,
} from "@/db/schema/mv_property_sales";
import type {
  ApartmentsByInseeYear,
  HousesByInseeYear,
  ApartmentsByInseeWeek,
  HousesByInseeWeek,
  InseeMonthParams,
  InseeYearParams,
  InseeWeekParams,
  ApartmentsBySectionMonth,
  HousesBySectionMonth,
  ApartmentsBySectionYear,
  HousesBySectionYear,
  SectionMonthParams,
  SectionYearParams,
  ApartmentsByInseeMonth,
  HousesByInseeMonth,
  SortBy,
  SortOrder,
} from "@app/shared";
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
function getOrderBy<
  T extends {
    inseeCode?: any;
    section?: any;
    year?: any;
    month?: any;
    iso_year?: any;
    iso_week?: any;
    total_sales: any;
    avg_price_m2: any;
    total_price: any;
    avg_price: any;
  },
>(view: T, sortBy: SortBy | undefined, sortOrder: SortOrder) {
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
      } else if (view.year) {
        return [dir(view.year)];
      }
      return [dir(view.total_sales)];

    case "month":
      if (view.month && view.year) {
        // Sort by month, but also by year for proper ordering across years
        return [dir(view.year), dir(view.month)];
      } else if (view.month) {
        return [dir(view.month)];
      }
      return [dir(view.total_sales)];

    case "iso_year":
      if (view.iso_year && view.iso_week) {
        // For weekly data: sort by iso_year, then iso_week
        return [dir(view.iso_year), dir(view.iso_week)];
      } else if (view.iso_year) {
        return [dir(view.iso_year)];
      }
      return [dir(view.total_sales)];

    case "iso_week":
      if (view.iso_week && view.iso_year) {
        // Sort by iso_week, but also by iso_year for proper ordering across years
        return [dir(view.iso_year), dir(view.iso_week)];
      } else if (view.iso_week) {
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

// ----------------------------------------------------------------------------
// Where condition builders
// ----------------------------------------------------------------------------

/**
 * Adds inseeCode filter conditions to the conditions array
 */
function addInseeCodeConditions<T extends { inseeCode: any }>(
  conditions: ReturnType<typeof eq>[],
  view: T,
  inseeCodes: string[] | undefined
): void {
  if (!inseeCodes) return;

  // Ensure it's an array (schema transform should handle this, but be defensive)
  const codes = Array.isArray(inseeCodes) ? inseeCodes : [inseeCodes];

  if (codes.length === 0) return;

  if (codes.length === 1) {
    conditions.push(eq(view.inseeCode, codes[0]));
  } else {
    conditions.push(inArray(view.inseeCode, codes));
  }
}

/**
 * Adds section filter conditions to the conditions array
 */
function addSectionConditions<T extends { section: any }>(
  conditions: ReturnType<typeof eq>[],
  view: T,
  sections: string[] | undefined
): void {
  if (!sections) return;

  // Ensure it's an array (schema transform should handle this, but be defensive)
  const secs = Array.isArray(sections) ? sections : [sections];

  if (secs.length === 0) return;

  if (secs.length === 1) {
    conditions.push(eq(view.section, secs[0]));
  } else {
    conditions.push(inArray(view.section, secs));
  }
}

function buildInseeWhereConditions<T extends { inseeCode: any }>(
  view: T,
  params: InseeMonthParams | InseeYearParams | InseeWeekParams
): ReturnType<typeof eq>[] {
  const conditions: ReturnType<typeof eq>[] = [];
  addInseeCodeConditions(conditions, view, params.inseeCode);
  return conditions;
}

function buildSectionWhereConditions<
  T extends { inseeCode: any; section: any },
>(
  view: T,
  params: SectionMonthParams | SectionYearParams
): ReturnType<typeof eq>[] {
  const conditions: ReturnType<typeof eq>[] = [];
  addInseeCodeConditions(conditions, view, params.inseeCode);
  addSectionConditions(conditions, view, params.section);
  return conditions;
}

function buildMonthWhereConditions(
  view:
    | typeof apartments_by_insee_code_month
    | typeof houses_by_insee_code_month,
  params: InseeMonthParams
) {
  const conditions = buildInseeWhereConditions(view, params);
  if (params.year) conditions.push(eq(view.year, params.year));
  if (params.month) conditions.push(eq(view.month, params.month));
  return conditions;
}

function buildYearWhereConditions(
  view: typeof apartments_by_insee_code_year | typeof houses_by_insee_code_year,
  params: InseeYearParams
) {
  const conditions = buildInseeWhereConditions(view, params);
  if (params.year) conditions.push(eq(view.year, params.year));
  return conditions;
}

function buildWeekWhereConditions(
  view: typeof apartments_by_insee_code_week | typeof houses_by_insee_code_week,
  params: InseeWeekParams
) {
  const conditions = buildInseeWhereConditions(view, params);
  if (params.iso_year) conditions.push(eq(view.iso_year, params.iso_year));
  if (params.iso_week) conditions.push(eq(view.iso_week, params.iso_week));
  return conditions;
}

function buildSectionMonthWhereConditions(
  view: typeof apartments_by_section_month | typeof houses_by_section_month,
  params: SectionMonthParams
) {
  const conditions = buildSectionWhereConditions(view, params);
  if (params.year) conditions.push(eq(view.year, params.year));
  if (params.month) conditions.push(eq(view.month, params.month));
  return conditions;
}

function buildSectionYearWhereConditions(
  view: typeof apartments_by_section_year | typeof houses_by_section_year,
  params: SectionYearParams
) {
  const conditions = buildSectionWhereConditions(view, params);
  if (params.year) conditions.push(eq(view.year, params.year));
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
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_month)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
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
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_month)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
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
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_year)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
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
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_year)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
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
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_week)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
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
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_week)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as HousesByInseeWeek[];
}

// ----------------------------------------------------------------------------
// Repositories: Monthly (SECTION × year × month)
// ----------------------------------------------------------------------------

export async function getAptsBySectionMonth(
  params: SectionMonthParams
): Promise<ApartmentsBySectionMonth[]> {
  const whereConditions = buildSectionMonthWhereConditions(
    apartments_by_section_month,
    params
  );

  const orderBy = getOrderBy(
    apartments_by_section_month,
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(apartments_by_section_month)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit)
    .offset(params.offset);

  return results as unknown as ApartmentsBySectionMonth[];
}

export async function getHousesBySectionMonth(
  params: SectionMonthParams
): Promise<HousesBySectionMonth[]> {
  const whereConditions = buildSectionMonthWhereConditions(
    houses_by_section_month,
    params
  );

  const orderBy = getOrderBy(
    houses_by_section_month,
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(houses_by_section_month)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit)
    .offset(params.offset);

  return results as unknown as HousesBySectionMonth[];
}

// ----------------------------------------------------------------------------
// Repositories: Yearly (SECTION × year)
// ----------------------------------------------------------------------------

export async function getAptsBySectionYear(
  params: SectionYearParams
): Promise<ApartmentsBySectionYear[]> {
  const whereConditions = buildSectionYearWhereConditions(
    apartments_by_section_year,
    params
  );

  const orderBy = getOrderBy(
    apartments_by_section_year,
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(apartments_by_section_year)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit)
    .offset(params.offset);

  return results as unknown as ApartmentsBySectionYear[];
}

export async function getHousesBySectionYear(
  params: SectionYearParams
): Promise<HousesBySectionYear[]> {
  const whereConditions = buildSectionYearWhereConditions(
    houses_by_section_year,
    params
  );

  const orderBy = getOrderBy(
    houses_by_section_year,
    params.sortBy,
    params.sortOrder
  );

  const results = await db
    .select()
    .from(houses_by_section_year)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit)
    .offset(params.offset);

  return results as unknown as HousesBySectionYear[];
}
