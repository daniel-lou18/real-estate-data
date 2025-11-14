import { describe, it, expect } from "vitest";
import router from "./analytics.index";
import { createTestApp } from "@/lib/create-app";
import * as HttpStatusCodes from "@/config/http-status-codes";

const testRouter = createTestApp(router);

describe("Analytics Routes", () => {
  const testInseeCode = "75112"; // Paris 12ème arrondissement
  const testSection = "75112000BZ";
  const testYear = 2023;
  const testMonth = 6;

  describe("Grouped by INSEE Code", () => {
    it("should return analytics grouped by insee code", async () => {
      const response = await testRouter.request(
        `/by-insee-code?inseeCode=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("count");
        expect(result[0]).toHaveProperty("totalPrice");
        expect(result[0]).toHaveProperty("avgPrice");
        expect(result[0]).toHaveProperty("avgPricePerM2");
      }
    });

    it("should handle year filter", async () => {
      const response = await testRouter.request(
        `/by-insee-code?inseeCode=${testInseeCode}&year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle pagination parameters", async () => {
      const response = await testRouter.request(
        `/by-insee-code?inseeCode=${testInseeCode}&limit=10&offset=0`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it("should support sortBy and sortOrder parameters", async () => {
      const response = await testRouter.request(
        `/by-insee-code?inseeCode=${testInseeCode}&sortBy=count&sortOrder=desc`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Grouped by INSEE Code and Section", () => {
    it("should return analytics grouped by insee code and section", async () => {
      const response = await testRouter.request(
        `/by-insee-code-section?inseeCode=${testInseeCode}&section=${testSection}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("section");
        expect(result[0]).toHaveProperty("count");
        expect(result[0]).toHaveProperty("totalPrice");
      }
    });

    it("should handle year filter", async () => {
      const response = await testRouter.request(
        `/by-insee-code-section?inseeCode=${testInseeCode}&section=${testSection}&year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle date range filters", async () => {
      const response = await testRouter.request(
        `/by-insee-code-section?inseeCode=${testInseeCode}&startDate=2023-01-01&endDate=2023-12-31`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Grouped by Property Type", () => {
    it("should return analytics grouped by property type", async () => {
      const response = await testRouter.request(`/by-property-type`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("propertyTypeCode");
        expect(result[0]).toHaveProperty("propertyTypeLabel");
        expect(result[0]).toHaveProperty("count");
        expect(result[0]).toHaveProperty("avgPrice");
      }
    });

    it("should handle year filter", async () => {
      const response = await testRouter.request(
        `/by-property-type?year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle property type filter", async () => {
      const response = await testRouter.request(
        `/by-property-type?propertyTypeCode=2`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Grouped by Year", () => {
    it("should return analytics grouped by year", async () => {
      const response = await testRouter.request(`/by-year`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("count");
        expect(result[0]).toHaveProperty("totalPrice");
        expect(result[0]).toHaveProperty("avgPrice");
      }
    });

    it("should handle year range filters", async () => {
      const response = await testRouter.request(
        `/by-year?startYear=2020&endYear=2023`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle insee code filter", async () => {
      const response = await testRouter.request(
        `/by-year?inseeCode=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should support ascending sort order", async () => {
      const response = await testRouter.request(
        `/by-year?sortBy=year&sortOrder=asc`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Grouped by Month", () => {
    it("should return analytics grouped by month", async () => {
      const response = await testRouter.request(`/by-month`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("month");
        expect(result[0]).toHaveProperty("count");
        expect(result[0]).toHaveProperty("totalPrice");
      }
    });

    it("should handle year filter", async () => {
      const response = await testRouter.request(`/by-month?year=${testYear}`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle year and month filters", async () => {
      const response = await testRouter.request(
        `/by-month?year=${testYear}&month=${testMonth}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle insee code filter", async () => {
      const response = await testRouter.request(
        `/by-month?inseeCode=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Summary", () => {
    it("should return summary analytics", async () => {
      const response = await testRouter.request(`/summary`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("totalPrice");
      expect(result).toHaveProperty("avgPrice");
      expect(result).toHaveProperty("avgPricePerM2");
    });

    it("should handle year filter", async () => {
      const response = await testRouter.request(`/summary?year=${testYear}`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("count");
    });

    it("should handle date range filters", async () => {
      const response = await testRouter.request(
        `/summary?startDate=2023-01-01&endDate=2023-12-31`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("count");
    });

    it("should handle insee code filter", async () => {
      const response = await testRouter.request(
        `/summary?inseeCode=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("count");
    });

    it("should handle department code filter", async () => {
      const response = await testRouter.request(`/summary?depCode=75`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("count");
    });
  });

  describe("Price per m2 Deciles", () => {
    it("should return price per m2 deciles", async () => {
      const response = await testRouter.request(`/price-per-m2-deciles`);
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("deciles");
      expect(result).toHaveProperty("totalTransactions");
      expect(Array.isArray(result.deciles)).toBe(true);
      expect(result.deciles.length).toBe(10);
      if (result.deciles.length > 0) {
        expect(result.deciles[0]).toHaveProperty("percentile");
        expect(result.deciles[0]).toHaveProperty("value");
      }
    });

    it("should handle year filter", async () => {
      const response = await testRouter.request(
        `/price-per-m2-deciles?year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("deciles");
      expect(result).toHaveProperty("totalTransactions");
    });

    it("should handle insee code filter", async () => {
      const response = await testRouter.request(
        `/price-per-m2-deciles?inseeCode=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("deciles");
    });

    it("should handle property type filter", async () => {
      const response = await testRouter.request(
        `/price-per-m2-deciles?propertyTypeCode=2`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(result).toHaveProperty("deciles");
    });
  });
});
