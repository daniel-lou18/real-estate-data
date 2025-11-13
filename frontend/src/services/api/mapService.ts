import { apiService } from "./baseApiService";
import type { MapFeatureParams, MapLegendParams, MapFeatureCollection, MapLegendResponse } from "@/types";

function createQueryString(params: MapFeatureParams | MapLegendParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item));
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export class MapService {
  private api = apiService;
  private readonly baseUrl = "/sales/analytics/map";

  async getFeatures(
    params: MapFeatureParams = {}
  ): Promise<MapFeatureCollection> {
    const queryString = createQueryString(params);
    const endpoint = queryString
      ? `${this.baseUrl}/features.geojson?${queryString}`
      : `${this.baseUrl}/features.geojson`;

    const response = await this.api.get<MapFeatureCollection>(endpoint);

    return response.data;
  }

  async getLegend(params: MapLegendParams = {}): Promise<MapLegendResponse> {
    const queryString = createQueryString(params);
    const endpoint = queryString
      ? `${this.baseUrl}/legend?${queryString}`
      : `${this.baseUrl}/legend`;

    const response = await this.api.get<MapLegendResponse>(endpoint);

    return response.data;
  }
}

export const mapService = new MapService();
