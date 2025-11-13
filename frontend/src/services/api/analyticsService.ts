import { z } from "zod";
import { apiService, BaseApiService } from "./baseApiService";
import * as mvSchemas from "./schemas";
import type * as mvTypes from "./types";

type QueryParams = Record<string, string | number | boolean>;

const toQueryParams = (
  params?: Record<string, unknown>
): QueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const queryParams: QueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value
        .filter(
          (item): item is string | number | boolean =>
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean"
        )
        .forEach((item) => {
          queryParams[key] = item;
        });
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      queryParams[key] = value;
    }
  });

  return queryParams;
};

/**
 * Analytics API service backed by materialized views.
 */
export class AnalyticsService {
  private readonly api: BaseApiService;
  private readonly baseUrl = "/sales/analytics/mv";

  constructor(api: BaseApiService = apiService) {
    this.api = api;
  }

  private async fetchCollection<T>(
    path: string,
    schema: z.ZodType<T>,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.get<unknown>(
      `${this.baseUrl}${path}`,
      toQueryParams(params)
    );

    return schema.parse(response.data);
  }

  async getApartmentsByInseeYear(
    params: Partial<mvTypes.InseeYearParams> = {}
  ): Promise<mvTypes.ApartmentsByInseeYear[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/year",
      mvSchemas.ApartmentsByInseeYearSchema.array(),
      params
    );
  }

  async getHousesByInseeYear(
    params: Partial<mvTypes.InseeYearParams> = {}
  ): Promise<mvTypes.HousesByInseeYear[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/year",
      mvSchemas.HousesByInseeYearSchema.array(),
      params
    );
  }

  async getApartmentsByInseeYoY(params: Partial<mvTypes.YearDeltaParams> = {}) {
    return this.fetchCollection(
      "/apartments/by-insee-code/year/deltas",
      mvSchemas.YearlyDeltasByInseeSchema.array(),
      params
    );
  }

  async getHousesByInseeYoY(params: Partial<mvTypes.YearDeltaParams> = {}) {
    return this.fetchCollection(
      "/houses/by-insee-code/year/deltas",
      mvSchemas.YearlyDeltasByInseeSchema.array(),
      params
    );
  }

  async getApartmentsByInseeMonth(
    params: Partial<mvTypes.InseeMonthParams> = {}
  ): Promise<mvTypes.ApartmentsByInseeMonth[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/month",
      mvSchemas.ApartmentsByInseeMonthSchema.array(),
      params
    );
  }

  async getHousesByInseeMonth(
    params: Partial<mvTypes.InseeMonthParams> = {}
  ): Promise<mvTypes.HousesByInseeMonth[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/month",
      mvSchemas.HousesByInseeMonthSchema.array(),
      params
    );
  }

  async getApartmentsByInseeWeek(
    params: Partial<mvTypes.InseeWeekParams> = {}
  ): Promise<mvTypes.ApartmentsByInseeWeek[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/week",
      mvSchemas.ApartmentsByInseeWeekSchema.array(),
      params
    );
  }

  async getHousesByInseeWeek(
    params: Partial<mvTypes.InseeWeekParams> = {}
  ): Promise<mvTypes.HousesByInseeWeek[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/week",
      mvSchemas.HousesByInseeWeekSchema.array(),
      params
    );
  }

  async getApartmentsBySectionYear(
    params: Partial<mvTypes.SectionYearParams> = {}
  ): Promise<mvTypes.ApartmentsBySectionYear[]> {
    return this.fetchCollection(
      "/apartments/by-section/year",
      mvSchemas.ApartmentsBySectionYearSchema.array(),
      params
    );
  }

  async getApartmentsBySectionYoY(
    params: Partial<mvTypes.YearDeltaParams> = {}
  ) {
    return this.fetchCollection(
      "/apartments/by-section/year/deltas",
      mvSchemas.YearlyDeltasBySectionSchema.array(),
      params
    );
  }

  async getHousesBySectionYoY(params: Partial<mvTypes.YearDeltaParams> = {}) {
    return this.fetchCollection(
      "/houses/by-section/year/deltas",
      mvSchemas.YearlyDeltasBySectionSchema.array(),
      params
    );
  }

  async getHousesBySectionYear(
    params: Partial<mvTypes.SectionYearParams> = {}
  ): Promise<mvTypes.HousesBySectionYear[]> {
    return this.fetchCollection(
      "/houses/by-section/year",
      mvSchemas.HousesBySectionYearSchema.array(),
      params
    );
  }

  async getApartmentsBySectionMonth(
    params: Partial<mvTypes.SectionMonthParams> = {}
  ): Promise<mvTypes.ApartmentsBySectionMonth[]> {
    return this.fetchCollection(
      "/apartments/by-section/month",
      mvSchemas.ApartmentsBySectionMonthSchema.array(),
      params
    );
  }

  async getHousesBySectionMonth(
    params: Partial<mvTypes.SectionMonthParams> = {}
  ): Promise<mvTypes.HousesBySectionMonth[]> {
    return this.fetchCollection(
      "/houses/by-section/month",
      mvSchemas.HousesBySectionMonthSchema.array(),
      params
    );
  }
}

export const analyticsService = new AnalyticsService();
