import { describe, it, expect } from "vitest";
import router from "./mv.index";
import { createTestApp } from "@/lib/create-app";
import * as HttpStatusCodes from "@/config/http-status-codes";

const testRouter = createTestApp(router);

describe("MV Routes", () => {
  const testInseeCode = "75112"; // Paris 12ème arrondissement
  const testSection = "75112000BZ";
  const testYear = 2023;
  const testMonth = 6;
  const testIsoYear = 2023;
  const testIsoWeek = 25;

  describe("Apartments by INSEE Code - Year", () => {
    it("should return apartments by insee code and year", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/year?inseeCodes=${testInseeCode}&year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("total_sales");
        expect(result[0]).toHaveProperty("avg_price_m2");
      }
    });

    it("should handle multiple insee codes", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/year?inseeCodes=${testInseeCode}&inseeCodes=75113`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle pagination parameters", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/year?inseeCodes=${testInseeCode}&limit=10&offset=0`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Houses by INSEE Code - Year", () => {
    it("should return houses by insee code and year", async () => {
      const response = await testRouter.request(
        `/houses/by-insee-code/year?inseeCodes=${testInseeCode}&year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("total_sales");
        expect(result[0]).toHaveProperty("avg_price_m2");
      }
    });
  });

  describe("Apartments by INSEE Code - Month", () => {
    it("should return apartments by insee code, year, and month", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/month?inseeCodes=${testInseeCode}&year=${testYear}&month=${testMonth}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("month");
        expect(result[0]).toHaveProperty("total_sales");
      }
    });

    it("should handle optional year and month parameters", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/month?inseeCodes=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Houses by INSEE Code - Month", () => {
    it("should return houses by insee code, year, and month", async () => {
      const response = await testRouter.request(
        `/houses/by-insee-code/month?inseeCodes=${testInseeCode}&year=${testYear}&month=${testMonth}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("month");
      }
    });
  });

  describe("Apartments by INSEE Code - Week", () => {
    it("should return apartments by insee code, iso year, and iso week", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/week?inseeCodes=${testInseeCode}&iso_year=${testIsoYear}&iso_week=${testIsoWeek}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("iso_year");
        expect(result[0]).toHaveProperty("iso_week");
      }
    });

    it("should handle optional iso_year and iso_week parameters", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/week?inseeCodes=${testInseeCode}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Houses by INSEE Code - Week", () => {
    it("should return houses by insee code, iso year, and iso week", async () => {
      const response = await testRouter.request(
        `/houses/by-insee-code/week?inseeCodes=${testInseeCode}&iso_year=${testIsoYear}&iso_week=${testIsoWeek}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("iso_year");
        expect(result[0]).toHaveProperty("iso_week");
      }
    });
  });

  describe("Apartments by Section - Year", () => {
    it("should return apartments by section and year", async () => {
      const response = await testRouter.request(
        `/apartments/by-section/year?inseeCodes=${testInseeCode}&sections=${testSection}&year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("section");
        expect(result[0]).toHaveProperty("year");
      }
    });

    it("should handle multiple sections", async () => {
      const response = await testRouter.request(
        `/apartments/by-section/year?inseeCodes=${testInseeCode}&sections=${testSection}&sections=75112000AY`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Houses by Section - Year", () => {
    it("should return houses by section and year", async () => {
      const response = await testRouter.request(
        `/houses/by-section/year?inseeCodes=${testInseeCode}&sections=${testSection}&year=${testYear}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("section");
        expect(result[0]).toHaveProperty("year");
      }
    });
  });

  describe("Apartments by Section - Month", () => {
    it("should return apartments by section, year, and month", async () => {
      const response = await testRouter.request(
        `/apartments/by-section/month?inseeCodes=${testInseeCode}&sections=${testSection}&year=${testYear}&month=${testMonth}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("section");
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("month");
      }
    });

    it("should handle optional year and month parameters", async () => {
      const response = await testRouter.request(
        `/apartments/by-section/month?inseeCodes=${testInseeCode}&sections=${testSection}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Houses by Section - Month", () => {
    it("should return houses by section, year, and month", async () => {
      const response = await testRouter.request(
        `/houses/by-section/month?inseeCodes=${testInseeCode}&sections=${testSection}&year=${testYear}&month=${testMonth}`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("inseeCode");
        expect(result[0]).toHaveProperty("section");
        expect(result[0]).toHaveProperty("year");
        expect(result[0]).toHaveProperty("month");
      }
    });
  });

  describe("Sorting and filtering", () => {
    it("should support sortBy and sortOrder parameters", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/year?inseeCodes=${testInseeCode}&sortBy=total_sales&sortOrder=desc`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should support ascending sort order", async () => {
      const response = await testRouter.request(
        `/apartments/by-insee-code/year?inseeCodes=${testInseeCode}&sortBy=year&sortOrder=asc`
      );
      expect(response.status).toBe(HttpStatusCodes.OK);
      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
