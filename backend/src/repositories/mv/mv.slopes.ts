import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  apartments_by_insee_code_month_slopes,
  houses_by_insee_code_month_slopes,
  apartments_by_section_month_slopes,
  houses_by_section_month_slopes,
} from "@/db/schema/mv_property_sales_slopes";
import type {
  ApartmentsByInseeMonthSlope,
  ApartmentsBySectionMonthSlope,
  HousesByInseeMonthSlope,
  HousesBySectionMonthSlope,
  InseeMonthSlopeParams,
  SectionMonthSlopeParams,
  SlopeSortBy,
  SortOrder,
} from "@app/shared";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function buildInseeMonthWhere(
  view:
    | typeof apartments_by_insee_code_month_slopes
    | typeof houses_by_insee_code_month_slopes,
  params: InseeMonthSlopeParams
) {
  const conditions = [];
  if (params.inseeCode) {
    conditions.push(eq(view.inseeCode, params.inseeCode));
  }
  // Note: year and month filters removed - views now have one row per location
  // with latest year metadata, so filtering by year/month doesn't make sense
  return conditions;
}

function buildSectionMonthWhere(
  view:
    | typeof apartments_by_section_month_slopes
    | typeof houses_by_section_month_slopes,
  params: SectionMonthSlopeParams
) {
  const conditions = [];
  if (params.inseeCode) {
    conditions.push(eq(view.inseeCode, params.inseeCode));
  }
  if (params.section) {
    conditions.push(eq(view.section, params.section));
  }
  // Note: year and month filters removed - views now have one row per location
  // with latest year metadata, so filtering by year/month doesn't make sense
  return conditions;
}

function getSlopeOrderBy<T extends Record<string, any>>(
  view: T,
  sortBy: SlopeSortBy | undefined,
  sortOrder: SortOrder
) {
  const dir = sortOrder === "asc" ? asc : desc;
  // Default order: by inseeCode/section first, then by the requested metric
  const defaultOrder = (view as any).inseeCode
    ? [dir((view as any).inseeCode)]
    : (view as any).section
      ? [dir((view as any).section)]
      : [];

  switch (sortBy) {
    case "inseeCode":
      return (view as any).inseeCode
        ? [dir((view as any).inseeCode)]
        : defaultOrder;
    case "section":
      return (view as any).section
        ? [dir((view as any).section)]
        : defaultOrder;
    case "year":
      return (view as any).year ? [dir((view as any).year)] : defaultOrder;
    case "month":
      return (view as any).month ? [dir((view as any).month)] : defaultOrder;
    case "window_start_year":
      return (view as any).window_start_year
        ? [dir((view as any).window_start_year)]
        : defaultOrder;
    case "window_start_month":
      return (view as any).window_start_month
        ? [dir((view as any).window_start_month)]
        : defaultOrder;
    case "window_months":
      return (view as any).window_months
        ? [dir((view as any).window_months)]
        : defaultOrder;
    default: {
      const targetColumn =
        (view as any)[sortBy ?? "total_sales_slope"] ??
        (view as any).total_sales_slope;
      if (targetColumn) {
        return [dir(targetColumn)];
      }
      return defaultOrder;
    }
  }
}

// ----------------------------------------------------------------------------
// Repositories
// ----------------------------------------------------------------------------

export async function getAptsByInseeMonthSlopes(
  params: InseeMonthSlopeParams
): Promise<ApartmentsByInseeMonthSlope[]> {
  const whereConditions = buildInseeMonthWhere(
    apartments_by_insee_code_month_slopes,
    params
  );

  const orderBy = getSlopeOrderBy(
    apartments_by_insee_code_month_slopes,
    params.sortBy ?? "inseeCode",
    params.sortOrder ?? "asc"
  );

  const results = await db
    .select()
    .from(apartments_by_insee_code_month_slopes)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as ApartmentsByInseeMonthSlope[];
}

export async function getHousesByInseeMonthSlopes(
  params: InseeMonthSlopeParams
): Promise<HousesByInseeMonthSlope[]> {
  const whereConditions = buildInseeMonthWhere(
    houses_by_insee_code_month_slopes,
    params
  );

  const orderBy = getSlopeOrderBy(
    houses_by_insee_code_month_slopes,
    params.sortBy ?? "inseeCode",
    params.sortOrder ?? "asc"
  );

  const results = await db
    .select()
    .from(houses_by_insee_code_month_slopes)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as HousesByInseeMonthSlope[];
}

export async function getAptsBySectionMonthSlopes(
  params: SectionMonthSlopeParams
): Promise<ApartmentsBySectionMonthSlope[]> {
  const whereConditions = buildSectionMonthWhere(
    apartments_by_section_month_slopes,
    params
  );

  const orderBy = getSlopeOrderBy(
    apartments_by_section_month_slopes,
    params.sortBy ?? "section",
    params.sortOrder ?? "asc"
  );

  const results = await db
    .select()
    .from(apartments_by_section_month_slopes)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as ApartmentsBySectionMonthSlope[];
}

export async function getHousesBySectionMonthSlopes(
  params: SectionMonthSlopeParams
): Promise<HousesBySectionMonthSlope[]> {
  const whereConditions = buildSectionMonthWhere(
    houses_by_section_month_slopes,
    params
  );

  const orderBy = getSlopeOrderBy(
    houses_by_section_month_slopes,
    params.sortBy ?? "section",
    params.sortOrder ?? "asc"
  );

  const results = await db
    .select()
    .from(houses_by_section_month_slopes)
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(...orderBy)
    .limit(params.limit ?? 200)
    .offset(params.offset ?? 0);

  return results as unknown as HousesBySectionMonthSlope[];
}
