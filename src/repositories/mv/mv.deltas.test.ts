import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getAptsByInseeYearDeltas,
  getHousesByInseeYearDeltas,
  getAptsBySectionYearDeltas,
  getHousesBySectionYearDeltas,
} from "./mv.deltas";

// ----------------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------------

/**
 * Helper function to check that a value is a number (not a string)
 */
function expectNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  expect(typeof value).toBe("number");
  expect(typeof value).not.toBe("string");
  expect(Number.isFinite(value)).toBe(true);
}

/**
 * Helper function to check that a value is a number or null
 */
function expectNumberOrNull(
  value: unknown,
  fieldName: string
): asserts value is number | null {
  if (value !== null) {
    expectNumber(value, fieldName);
  } else {
    expect(value).toBeNull();
  }
}

/**
 * Validates a MetricDelta object structure and types
 */
function expectMetricDelta(
  metricDelta: unknown,
  metricName: string
): asserts metricDelta is {
  base: number | null;
  current: number | null;
  delta: number | null;
  pct_change: number | null;
} {
  expect(metricDelta).toBeDefined();
  expect(typeof metricDelta).toBe("object");
  expect(metricDelta).not.toBeNull();

  const delta = metricDelta as Record<string, unknown>;
  expect(delta).toHaveProperty("base");
  expect(delta).toHaveProperty("current");
  expect(delta).toHaveProperty("delta");
  expect(delta).toHaveProperty("pct_change");

  expectNumberOrNull(delta.base, `${metricName}.base`);
  expectNumberOrNull(delta.current, `${metricName}.current`);
  expectNumberOrNull(delta.delta, `${metricName}.delta`);
  expectNumberOrNull(delta.pct_change, `${metricName}.pct_change`);
}

/**
 * Validates core metrics structure
 */
function expectCoreMetrics(result: Record<string, unknown>) {
  const coreMetrics = [
    "total_sales",
    "total_price",
    "avg_price",
    "total_area",
    "avg_area",
    "avg_price_m2",
    "median_price",
    "median_area",
    "price_m2_p25",
    "price_m2_p75",
    "price_m2_iqr",
    "price_m2_stddev",
  ];

  for (const metric of coreMetrics) {
    expect(result).toHaveProperty(metric);
    expectMetricDelta(result[metric], metric);
  }
}

/**
 * Validates apartment composition metrics
 */
function expectApartmentComposition(
  apartments: unknown,
  prefix: string = "apartments"
) {
  expect(apartments).toBeDefined();
  expect(typeof apartments).toBe("object");
  expect(apartments).not.toBeNull();

  const apt = apartments as Record<string, unknown>;
  const compositionMetrics = [
    "total_apartments",
    "apartment_1_room",
    "apartment_2_room",
    "apartment_3_room",
    "apartment_4_room",
    "apartment_5_room",
  ];

  for (const metric of compositionMetrics) {
    expect(apt).toHaveProperty(metric);
    expectMetricDelta(apt[metric], `${prefix}.${metric}`);
  }
}

/**
 * Validates house composition metrics
 */
function expectHouseComposition(houses: unknown, prefix: string = "houses") {
  expect(houses).toBeDefined();
  expect(typeof houses).toBe("object");
  expect(houses).not.toBeNull();

  const house = houses as Record<string, unknown>;
  const compositionMetrics = [
    "total_houses",
    "house_1_room",
    "house_2_room",
    "house_3_room",
    "house_4_room",
    "house_5_room",
  ];

  for (const metric of compositionMetrics) {
    expect(house).toHaveProperty(metric);
    expectMetricDelta(house[metric], `${prefix}.${metric}`);
  }
}

// ----------------------------------------------------------------------------
// Tests for getAptsByInseeYearDeltas
// ----------------------------------------------------------------------------

describe("getAptsByInseeYearDeltas", () => {
  beforeAll(async () => {
    // Ensure we have some test data
    // This assumes the database already has data
  });

  afterAll(async () => {
    // Clean up if needed
  });

  it("should return results with correct structure and types", async () => {
    const results = await getAptsByInseeYearDeltas({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      // Check base fields
      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("base_year");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      // Check core metrics structure
      expectCoreMetrics(result);

      // Check apartment composition
      expect(result).toHaveProperty("apartments");
      expectApartmentComposition(result.apartments);

      // Check that base_year is one less than year
      expect(result.base_year).toBe(result.year - 1);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getAptsByInseeYearDeltas({
      inseeCode: "75118", // Paris 18th arrondissement
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectCoreMetrics(result);
        expectApartmentComposition(result.apartments);
      });
    }
  });

  it("should work with year filter", async () => {
    const results = await getAptsByInseeYearDeltas({
      year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expectNumber(result.year, "year");
        expect(result.year).toBe(2023);
        expect(result.base_year).toBe(2022);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with base_year filter", async () => {
    const results = await getAptsByInseeYearDeltas({
      base_year: 2022,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expectNumber(result.base_year, "base_year");
        expect(result.base_year).toBe(2022);
        expect(result.year).toBe(2023);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with metric-specific filters", async () => {
    const results = await getAptsByInseeYearDeltas({
      metric: "avg_price_m2",
      min_current: 1000,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        const avgPriceM2 = result.avg_price_m2;
        expectMetricDelta(avgPriceM2, "avg_price_m2");
        if (avgPriceM2.current !== null) {
          expect(avgPriceM2.current).toBeGreaterThanOrEqual(1000);
        }
      });
    }
  });

  it("should work with min_pct_change filter", async () => {
    const results = await getAptsByInseeYearDeltas({
      metric: "total_sales",
      min_pct_change: 10, // At least 10% increase
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        const totalSales = result.total_sales;
        expectMetricDelta(totalSales, "total_sales");
        if (totalSales.pct_change !== null) {
          expect(totalSales.pct_change).toBeGreaterThanOrEqual(10);
        }
      });
    }
  });

  it("should work with sorting", async () => {
    const results = await getAptsByInseeYearDeltas({
      sortBy: "pct_change",
      sortOrder: "desc",
      metric: "avg_price_m2",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by pct_change descending
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1].avg_price_m2.pct_change;
        const current = results[i].avg_price_m2.pct_change;

        if (prev !== null && current !== null) {
          expect(current).toBeLessThanOrEqual(prev);
        }
      }
    }
  });

  it("should work with pagination", async () => {
    const firstPage = await getAptsByInseeYearDeltas({
      limit: 5,
      offset: 0,
      sortBy: "current",
      metric: "total_sales",
    });

    const secondPage = await getAptsByInseeYearDeltas({
      limit: 5,
      offset: 5,
      sortBy: "current",
      metric: "total_sales",
    });

    expect(Array.isArray(firstPage)).toBe(true);
    expect(Array.isArray(secondPage)).toBe(true);

    // Results should be different (unless there are fewer than 10 total)
    if (firstPage.length === 5 && secondPage.length > 0) {
      expect(firstPage[0].inseeCode).not.toBe(secondPage[0].inseeCode);
    }
  });

  it("should handle empty results gracefully", async () => {
    const results = await getAptsByInseeYearDeltas({
      year: 1900, // Very old year that shouldn't have data
      inseeCode: "99999", // Non-existent INSEE code
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsByInseeYearDeltas({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      // Check base fields are numbers
      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      // Check a sample metric delta
      const totalSales = result.total_sales;
      expectMetricDelta(totalSales, "total_sales");

      // Check apartment composition
      const apartments = result.apartments;
      if (apartments) {
        const totalApts = apartments.total_apartments;
        expectMetricDelta(totalApts, "apartments.total_apartments");
      }
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesByInseeYearDeltas
// ----------------------------------------------------------------------------

describe("getHousesByInseeYearDeltas", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesByInseeYearDeltas({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      // Check base fields
      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("base_year");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      // Check core metrics structure
      expectCoreMetrics(result);

      // Check house composition
      expect(result).toHaveProperty("houses");
      expectHouseComposition(result.houses);

      // Check that base_year is one less than year
      expect(result.base_year).toBe(result.year - 1);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getHousesByInseeYearDeltas({
      inseeCode: "75118",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectCoreMetrics(result);
        expectHouseComposition(result.houses);
      });
    }
  });

  it("should work with metric-specific filters", async () => {
    const results = await getHousesByInseeYearDeltas({
      metric: "median_price",
      min_delta: 10000,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        const medianPrice = result.median_price;
        expectMetricDelta(medianPrice, "median_price");
        if (medianPrice.delta !== null) {
          expect(medianPrice.delta).toBeGreaterThanOrEqual(10000);
        }
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesByInseeYearDeltas({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      const avgPrice = result.avg_price;
      expectMetricDelta(avgPrice, "avg_price");

      const houses = result.houses;
      if (houses) {
        const totalHouses = houses.total_houses;
        expectMetricDelta(totalHouses, "houses.total_houses");
      }
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getAptsBySectionYearDeltas
// ----------------------------------------------------------------------------

describe("getAptsBySectionYearDeltas", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getAptsBySectionYearDeltas({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      // Check base fields
      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("section");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("base_year");
      expect(typeof result.inseeCode).toBe("string");
      expect(typeof result.section).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      // Check core metrics structure
      expectCoreMetrics(result);

      // Check apartment composition
      expect(result).toHaveProperty("apartments");
      expectApartmentComposition(result.apartments);

      // Check that base_year is one less than year
      expect(result.base_year).toBe(result.year - 1);
    }
  });

  it("should work with section filter", async () => {
    const results = await getAptsBySectionYearDeltas({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
        expectApartmentComposition(result.apartments);
      });
    }
  });

  it("should work with inseeCode and section filters", async () => {
    const results = await getAptsBySectionYearDeltas({
      inseeCode: "75118",
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with sorting by different metrics", async () => {
    const metrics = [
      "total_sales",
      "avg_price",
      "avg_price_m2",
      "median_price",
    ] as const;

    for (const metric of metrics) {
      const results = await getAptsBySectionYearDeltas({
        metric,
        sortBy: "delta",
        sortOrder: "desc",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);

      if (results.length > 1) {
        // Check that results are sorted by delta descending
        for (let i = 1; i < results.length; i++) {
          const prev = (results[i - 1] as Record<string, unknown>)[metric] as {
            delta: number | null;
          };
          const current = (results[i] as Record<string, unknown>)[metric] as {
            delta: number | null;
          };

          if (prev.delta !== null && current.delta !== null) {
            expect(current.delta).toBeLessThanOrEqual(prev.delta);
          }
        }
      }
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsBySectionYearDeltas({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      const totalArea = result.total_area;
      expectMetricDelta(totalArea, "total_area");

      const apartments = result.apartments;
      if (apartments) {
        const apt3Room = apartments.apartment_3_room;
        expectMetricDelta(apt3Room, "apartments.apartment_3_room");
      }
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesBySectionYearDeltas
// ----------------------------------------------------------------------------

describe("getHousesBySectionYearDeltas", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesBySectionYearDeltas({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      // Check base fields
      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("section");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("base_year");
      expect(typeof result.inseeCode).toBe("string");
      expect(typeof result.section).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      // Check core metrics structure
      expectCoreMetrics(result);

      // Check house composition
      expect(result).toHaveProperty("houses");
      expectHouseComposition(result.houses);

      // Check that base_year is one less than year
      expect(result.base_year).toBe(result.year - 1);
    }
  });

  it("should work with section filter", async () => {
    const results = await getHousesBySectionYearDeltas({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
        expectHouseComposition(result.houses);
      });
    }
  });

  it("should work with max_current filter", async () => {
    const results = await getHousesBySectionYearDeltas({
      metric: "total_sales",
      max_current: 100,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        const totalSales = result.total_sales;
        expectMetricDelta(totalSales, "total_sales");
        if (totalSales.current !== null) {
          expect(totalSales.current).toBeLessThanOrEqual(100);
        }
      });
    }
  });

  it("should work with min_base filter", async () => {
    const results = await getHousesBySectionYearDeltas({
      metric: "avg_price",
      min_base: 100000,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        const avgPrice = result.avg_price;
        expectMetricDelta(avgPrice, "avg_price");
        if (avgPrice.base !== null) {
          expect(avgPrice.base).toBeGreaterThanOrEqual(100000);
        }
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesBySectionYearDeltas({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.base_year, "base_year");

      const priceM2P25 = result.price_m2_p25;
      expectMetricDelta(priceM2P25, "price_m2_p25");

      const houses = result.houses;
      if (houses) {
        const house4Room = houses.house_4_room;
        expectMetricDelta(house4Room, "houses.house_4_room");
      }
    }
  });
});

// ----------------------------------------------------------------------------
// Cross-function tests
// ----------------------------------------------------------------------------

describe("Delta repository functions - cross-function tests", () => {
  it("should handle all sortBy options correctly", async () => {
    const sortOptions = ["pct_change", "delta", "current", "base"] as const;

    for (const sortBy of sortOptions) {
      const results = await getAptsByInseeYearDeltas({
        metric: "total_sales",
        sortBy,
        sortOrder: "desc",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      // Just verify it doesn't throw and returns results
      if (results.length > 0) {
        expectCoreMetrics(results[0]);
      }
    }
  });

  it("should handle all metric options correctly", async () => {
    const metrics = [
      "total_sales",
      "total_price",
      "avg_price",
      "total_area",
      "avg_area",
      "avg_price_m2",
      "median_price",
      "median_area",
      "price_m2_p25",
      "price_m2_p75",
      "price_m2_iqr",
      "price_m2_stddev",
    ] as const;

    for (const metric of metrics) {
      const results = await getAptsByInseeYearDeltas({
        metric,
        sortBy: "current",
        limit: 3,
      });

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        const result = results[0];
        expect(result).toHaveProperty(metric);
        expectMetricDelta((result as Record<string, unknown>)[metric], metric);
      }
    }
  });

  it("should respect limit parameter", async () => {
    const limits = [1, 5, 10, 50];

    for (const limit of limits) {
      const results = await getAptsByInseeYearDeltas({
        limit,
        offset: 0,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(limit);
    }
  });

  it("should handle edge case: year and base_year relationship", async () => {
    const results = await getAptsByInseeYearDeltas({
      year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expectNumber(result.year, "year");
        expectNumber(result.base_year, "base_year");
        expect(result.base_year).toBe(result.year - 1);
      });
    }
  });

  it("should handle null pct_change values correctly", async () => {
    // pct_change can be null when base is 0 or missing
    const results = await getAptsByInseeYearDeltas({
      limit: 100, // Get more results to find edge cases
    });

    expect(Array.isArray(results)).toBe(true);

    // Verify that null pct_change values are handled correctly
    results.forEach((result) => {
      expectCoreMetrics(result);

      // Check that if base is 0, pct_change should be null
      const totalSales = result.total_sales;
      if (totalSales.base === 0) {
        expect(totalSales.pct_change).toBeNull();
      }
    });
  });
});
