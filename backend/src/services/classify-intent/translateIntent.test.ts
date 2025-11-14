import { describe, it, expect } from "vitest";
import { translateIntent } from "./translateIntent";
import type { UserIntent } from "@app/shared";
import { FEATURE_YEARS, MONTHS } from "@app/shared";
import { ZodError } from "zod";

describe("translateIntent", () => {
  describe("basic translation with defaults", () => {
    it("should return default values when empty intent is provided", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);

      expect(result).toMatchObject({
        level: "commune",
        propertyType: "apartment",
        field: "avg_price_m2",
        year: FEATURE_YEARS[FEATURE_YEARS.length - 1],
        inseeCodes: [],
        sections: [],
        month: undefined,
        filters: undefined,
        sortBy: "avg_price_m2",
        sortOrder: "desc",
        limit: 200,
        offset: 0,
      });
    });
  });

  describe("explicit field values", () => {
    it("should use provided propertyType", () => {
      const intent: UserIntent = {
        propertyType: "house",
      };

      const result = translateIntent(intent);
      expect(result.propertyType).toBe("house");
    });

    it("should use provided metric", () => {
      const intent: UserIntent = {
        metric: "total_sales",
      };

      const result = translateIntent(intent);
      expect(result.field).toBe("total_sales");
    });

    it("should use provided year", () => {
      const intent: UserIntent = {
        year: 2023,
      };

      const result = translateIntent(intent);
      expect(result.year).toBe(2023);
    });

    it("should use provided month", () => {
      const intent: UserIntent = {
        month: 5,
      };

      const result = translateIntent(intent);
      expect(result.month).toBe(5);
    });

    it("should use provided limit", () => {
      const intent: UserIntent = {
        limit: 100,
      };

      const result = translateIntent(intent);
      expect(result.limit).toBe(100);
    });

    it("should use provided sortOrder", () => {
      const intent: UserIntent = {
        sortOrder: "asc",
      };

      const result = translateIntent(intent);
      expect(result.sortOrder).toBe("asc");
    });

    it("should use provided primaryDimension", () => {
      const intent: UserIntent = {
        primaryDimension: "inseeCode",
      };

      const result = translateIntent(intent);
      expect(result.sortBy).toBe("inseeCode");
    });
  });

  describe("location fields", () => {
    it("should always return empty inseeCodes array", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);
      expect(result.inseeCodes).toEqual([]);
    });

    it("should always return empty sections array", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);
      expect(result.sections).toEqual([]);
    });
  });

  describe("property type", () => {
    it("should use explicit propertyType when provided", () => {
      const intent: UserIntent = {
        propertyType: "house",
      };

      const result = translateIntent(intent);
      expect(result.propertyType).toBe("house");
    });

    it("should default to apartment when no propertyType provided", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);
      expect(result.propertyType).toBe("apartment");
    });
  });

  describe("level inference", () => {
    it("should default to commune level", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);
      expect(result.level).toBe("commune");
    });

    it("should use section level when primaryDimension is section", () => {
      const intent: UserIntent = {
        primaryDimension: "section",
      };

      const result = translateIntent(intent);
      expect(result.level).toBe("section");
    });
  });

  describe("sort by inference", () => {
    it("should use primaryDimension as sortBy when provided", () => {
      const intent: UserIntent = {
        primaryDimension: "year",
      };

      const result = translateIntent(intent);
      expect(result.sortBy).toBe("year");
    });

    it("should use metric as sortBy when primaryDimension not provided and metric is sortable", () => {
      const intent: UserIntent = {
        metric: "total_sales",
      };

      const result = translateIntent(intent);
      expect(result.sortBy).toBe("total_sales");
    });

    it("should use default sortBy when metric is not sortable", () => {
      const intent: UserIntent = {
        metric: "min_price",
      };

      const result = translateIntent(intent);
      expect(result.sortBy).toBe("avg_price_m2");
    });

    it("should use default sortBy when neither dimension nor metric provided", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);
      expect(result.sortBy).toBe("avg_price_m2");
    });

    it("should prioritize primaryDimension over metric", () => {
      const intent: UserIntent = {
        primaryDimension: "month",
        metric: "total_sales",
      };

      const result = translateIntent(intent);
      expect(result.sortBy).toBe("month");
    });
  });

  describe("minSales handling", () => {
    it("should add total_sales filter when minSales is provided", () => {
      const intent: UserIntent = {
        minSales: 10,
      };

      const result = translateIntent(intent);
      expect(result.filters?.total_sales).toEqual({
        operation: "gte",
        value: 10,
      });
    });

    it("should merge minSales with existing filters", () => {
      const intent: UserIntent = {
        minSales: 5,
        filters: {
          avg_price_m2: {
            operation: "gte",
            value: 1000,
          },
        },
      };

      const result = translateIntent(intent);
      expect(result.filters?.total_sales).toEqual({
        operation: "gte",
        value: 5,
      });
      expect(result.filters?.avg_price_m2).toEqual({
        operation: "gte",
        value: 1000,
      });
    });

    it("should ignore minSales when zero", () => {
      const intent: UserIntent = {
        minSales: 0,
      };

      const result = translateIntent(intent);
      expect(result.filters?.total_sales).toBeUndefined();
    });

    it("should ignore minSales when negative (handled by schema validation)", () => {
      const intent = {
        minSales: -5,
      };

      // Negative minSales is rejected by schema validation
      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });
  });

  describe("year validation", () => {
    it("should reject invalid years (too low)", () => {
      const intent = {
        year: 2010,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid years (too high)", () => {
      const intent = {
        year: 2030,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should accept valid years", () => {
      for (const year of FEATURE_YEARS) {
        const intent: UserIntent = {
          year,
        };

        const result = translateIntent(intent);
        expect(result.year).toBe(year);
      }
    });
  });

  describe("month validation", () => {
    it("should reject invalid months (too low)", () => {
      const intent = {
        month: 0,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid months (too high)", () => {
      const intent = {
        month: 13,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should accept valid months", () => {
      for (const month of MONTHS) {
        const intent: UserIntent = {
          month,
        };

        const result = translateIntent(intent);
        expect(result.month).toBe(month);
      }
    });
  });

  describe("metric filters", () => {
    it("should preserve metric filters", () => {
      const intent: UserIntent = {
        filters: {
          avg_price_m2: {
            operation: "between",
            value: [1000, 5000],
          },
          total_sales: {
            operation: "gte",
            value: 5,
          },
        },
      };

      const result = translateIntent(intent);
      expect(result.filters?.avg_price_m2).toBeDefined();
      expect(result.filters?.total_sales).toBeDefined();
    });

    it("should return undefined filters when filters object is empty", () => {
      const intent: UserIntent = {
        filters: {},
      };

      const result = translateIntent(intent);
      expect(result.filters).toBeUndefined();
    });
  });

  describe("complex scenarios", () => {
    it("should handle full intent with all fields", () => {
      const intent: UserIntent = {
        primaryDimension: "inseeCode",
        metric: "avg_price_m2",
        propertyType: "house",
        year: 2023,
        month: 6,
        limit: 50,
        sortOrder: "asc",
        minSales: 20,
        filters: {
          avg_price_m2: {
            operation: "gte",
            value: 1000,
          },
          total_sales: {
            operation: "gte",
            value: 15,
          },
        },
      };

      const result = translateIntent(intent);

      expect(result).toMatchObject({
        level: "commune",
        propertyType: "house",
        field: "avg_price_m2",
        year: 2023,
        month: 6,
        limit: 50,
        sortOrder: "asc",
        sortBy: "inseeCode",
        offset: 0,
        inseeCodes: [],
        sections: [],
      });

      expect(result.filters?.total_sales).toBeDefined();
      expect(result.filters?.avg_price_m2).toBeDefined();
    });

    it("should handle section-level query", () => {
      const intent: UserIntent = {
        primaryDimension: "section",
        metric: "total_sales",
        propertyType: "apartment",
        year: 2024,
      };

      const result = translateIntent(intent);

      expect(result).toMatchObject({
        level: "section",
        propertyType: "apartment",
        field: "total_sales",
        year: 2024,
        sortBy: "section",
        inseeCodes: [],
        sections: [],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle undefined filters", () => {
      const intent: UserIntent = {
        filters: undefined,
      };

      const result = translateIntent(intent);
      expect(result.filters).toBeUndefined();
      expect(result.inseeCodes).toEqual([]);
      expect(result.sections).toEqual([]);
    });

    it("should preserve offset as 0", () => {
      const intent: UserIntent = {};

      const result = translateIntent(intent);
      expect(result.offset).toBe(0);
    });
  });

  describe("schema validation", () => {
    it("should reject invalid filter value types", () => {
      const intent = {
        filters: {
          avg_price_m2: {
            operation: "gte" as const,
            value: "1000", // String not allowed
          },
        },
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid minSales (negative)", () => {
      const intent = {
        minSales: -5,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid minSales (decimal)", () => {
      const intent = {
        minSales: 10.7,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid limit (too high)", () => {
      const intent = {
        limit: 501,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid limit (too low)", () => {
      const intent = {
        limit: 0,
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject dimension fields in filters", () => {
      const intent = {
        filters: {
          inseeCode: {
            operation: "gte" as const,
            value: 75101,
          },
        },
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });

    it("should reject invalid metric field names in filters", () => {
      const intent = {
        filters: {
          invalidField: {
            operation: "gte" as const,
            value: 100,
          },
        },
      };

      expect(() => translateIntent(intent as any)).toThrow(ZodError);
    });
  });
});
