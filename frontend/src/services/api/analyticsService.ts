import { z } from "zod";
import { apiService, BaseApiService } from "./baseApiService";
import * as shared from "@app/shared";

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
    params: Partial<shared.InseeYearParams> = {}
  ): Promise<shared.ApartmentsByInseeYear[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/year",
      shared.ApartmentsByInseeYearSchema.array(),
      params
    );
  }

  async getHousesByInseeYear(
    params: Partial<shared.InseeYearParams> = {}
  ): Promise<shared.HousesByInseeYear[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/year",
      shared.HousesByInseeYearSchema.array(),
      params
    );
  }

  async getApartmentsByInseeYoY(params: Partial<shared.YearDeltaParams> = {}) {
    return this.fetchCollection(
      "/apartments/by-insee-code/year/deltas",
      shared.YearlyDeltasByInseeSchema.array(),
      params
    );
  }

  async getHousesByInseeYoY(params: Partial<shared.YearDeltaParams> = {}) {
    return this.fetchCollection(
      "/houses/by-insee-code/year/deltas",
      shared.YearlyDeltasByInseeSchema.array(),
      params
    );
  }

  async getApartmentsByInseeMonth(
    params: Partial<shared.InseeMonthParams> = {}
  ): Promise<shared.ApartmentsByInseeMonth[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/month",
      shared.ApartmentsByInseeMonthSchema.array(),
      params
    );
  }

  async getHousesByInseeMonth(
    params: Partial<shared.InseeMonthParams> = {}
  ): Promise<shared.HousesByInseeMonth[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/month",
      shared.HousesByInseeMonthSchema.array(),
      params
    );
  }

  async getApartmentsByInseeWeek(
    params: Partial<shared.InseeWeekParams> = {}
  ): Promise<shared.ApartmentsByInseeWeek[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/week",
      shared.ApartmentsByInseeWeekSchema.array(),
      params
    );
  }

  async getHousesByInseeWeek(
    params: Partial<shared.InseeWeekParams> = {}
  ): Promise<shared.HousesByInseeWeek[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/week",
      shared.HousesByInseeWeekSchema.array(),
      params
    );
  }

  async getApartmentsBySectionYear(
    params: Partial<shared.SectionYearParams> = {}
  ): Promise<shared.ApartmentsBySectionYear[]> {
    return this.fetchCollection(
      "/apartments/by-section/year",
      shared.ApartmentsBySectionYearSchema.array(),
      params
    );
  }

  async getApartmentsBySectionYoY(
    params: Partial<shared.YearDeltaParams> = {}
  ) {
    return this.fetchCollection(
      "/apartments/by-section/year/deltas",
      shared.YearlyDeltasBySectionSchema.array(),
      params
    );
  }

  async getHousesBySectionYoY(params: Partial<shared.YearDeltaParams> = {}) {
    return this.fetchCollection(
      "/houses/by-section/year/deltas",
      shared.YearlyDeltasBySectionSchema.array(),
      params
    );
  }

  async getHousesBySectionYear(
    params: Partial<shared.SectionYearParams> = {}
  ): Promise<shared.HousesBySectionYear[]> {
    return this.fetchCollection(
      "/houses/by-section/year",
      shared.HousesBySectionYearSchema.array(),
      params
    );
  }

  async getApartmentsBySectionMonth(
    params: Partial<shared.SectionMonthParams> = {}
  ): Promise<shared.ApartmentsBySectionMonth[]> {
    return this.fetchCollection(
      "/apartments/by-section/month",
      shared.ApartmentsBySectionMonthSchema.array(),
      params
    );
  }

  async getHousesBySectionMonth(
    params: Partial<shared.SectionMonthParams> = {}
  ): Promise<shared.HousesBySectionMonth[]> {
    return this.fetchCollection(
      "/houses/by-section/month",
      shared.HousesBySectionMonthSchema.array(),
      params
    );
  }
}

export const analyticsService = new AnalyticsService();
