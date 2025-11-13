/**
 * Generic API service for handling HTTP requests
 * Provides a modular, type-safe, and agnostic approach to API communication
 */

export interface ApiRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: unknown;
}

/**
 * Generic API service class for handling HTTP requests
 */
export class BaseApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(
    url: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  /**
   * Generic request method
   */
  private async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { method, url, headers = {}, body, params } = config;

    const requestUrl = this.buildUrl(url, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(requestUrl, requestConfig);

      if (!response.ok) {
        const errorData = await this.parseResponse(response);
        throw new Error(
          `HTTP error! status: ${response.status}, statusText: ${response.statusText}`,
          {
            cause: {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            },
          }
        );
      }

      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred", { cause: error });
    }
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return response.json();
    }

    if (contentType?.includes("text/")) {
      return response.text() as T;
    }

    return response.blob() as T;
  }

  /**
   * GET request
   */
  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "GET",
      url,
      params,
      headers,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "POST",
      url,
      body,
      params,
      headers,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "PUT",
      url,
      body,
      params,
      headers,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    url: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "DELETE",
      url,
      params,
      headers,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "PATCH",
      url,
      body,
      params,
      headers,
    });
  }
}

/**
 * Default API service instance
 */
export const apiService = new BaseApiService("http://localhost:3000/api");
