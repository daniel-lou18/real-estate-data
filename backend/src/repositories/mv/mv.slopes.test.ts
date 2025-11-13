import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getAptsByInseeMonthSlopes,
  getHousesByInseeMonthSlopes,
  getAptsBySectionMonthSlopes,
  getHousesBySectionMonthSlopes,
} from "./mv.slopes";

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
 * Validates window metadata structure
 */
function expectWindowMetadata(result: Record<string, unknown>) {
  expect(result).toHaveProperty("window_months");
  expect(result).toHaveProperty("window_start_year");
  expect(result).toHaveProperty("window_start_month");

  expectNumber(result.window_months, "window_months");
  expect(result.window_months).toBeGreaterThanOrEqual(1);
  expect(result.window_months).toBeLessThanOrEqual(12);

  expectNumberOrNull(result.window_start_year, "window_start_year");
  expectNumberOrNull(result.window_start_month, "window_start_month");

  if (result.window_start_month !== null) {
    expect(result.window_start_month).toBeGreaterThanOrEqual(1);
    expect(result.window_start_month).toBeLessThanOrEqual(12);
  }
}

/**
 * Validates core aggregate slope metrics structure
 */
function expectCoreSlopeMetrics(result: Record<string, unknown>) {
  const coreSlopeMetrics = [
    "total_sales_slope",
    "total_price_slope",
    "avg_price_slope",
    "total_area_slope",
    "avg_area_slope",
    "avg_price_m2_slope",
    "min_price_slope",
    "max_price_slope",
    "median_price_slope",
    "median_area_slope",
    "min_price_m2_slope",
    "max_price_m2_slope",
    "price_m2_p25_slope",
    "price_m2_p75_slope",
    "price_m2_iqr_slope",
    "price_m2_stddev_slope",
  ];

  for (const metric of coreSlopeMetrics) {
    expect(result).toHaveProperty(metric);
    expectNumberOrNull(result[metric], metric);
  }
}

/**
 * Validates apartment composition slope metrics
 */
function expectApartmentCompositionSlopes(result: Record<string, unknown>) {
  const compositionSlopeMetrics = [
    "total_apartments_slope",
    "apartment_1_room_slope",
    "apartment_2_room_slope",
    "apartment_3_room_slope",
    "apartment_4_room_slope",
    "apartment_5_room_slope",
  ];

  for (const metric of compositionSlopeMetrics) {
    expect(result).toHaveProperty(metric);
    expectNumberOrNull(result[metric], metric);
  }
}

/**
 * Validates house composition slope metrics
 */
function expectHouseCompositionSlopes(result: Record<string, unknown>) {
  const compositionSlopeMetrics = [
    "total_houses_slope",
    "house_1_room_slope",
    "house_2_room_slope",
    "house_3_room_slope",
    "house_4_room_slope",
    "house_5_room_slope",
  ];

  for (const metric of compositionSlopeMetrics) {
    expect(result).toHaveProperty(metric);
    expectNumberOrNull(result[metric], metric);
  }
}

// ----------------------------------------------------------------------------
// Tests for getAptsByInseeMonthSlopes
// ----------------------------------------------------------------------------

describe("getAptsByInseeMonthSlopes", () => {
  beforeAll(async () => {
    // Ensure we have some test data
    // This assumes the database already has data
  });

  afterAll(async () => {
    // Clean up if needed
  });

  it("should return results with correct structure and types", async () => {
    const results = await getAptsByInseeMonthSlopes({
      limit: 5,
      offset: 0,
      sortBy: "inseeCode",
      sortOrder: "asc",
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      // Check base fields
      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);

      // Check window metadata
      expectWindowMetadata(result);

      // Check core slope metrics
      expectCoreSlopeMetrics(result);

      // Check apartment composition slopes
      expectApartmentCompositionSlopes(result);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getAptsByInseeMonthSlopes({
      inseeCode: "75118", // Paris 18th arrondissement
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
        expectApartmentCompositionSlopes(result);
      });
    }
  });

  it("should return year and month as metadata fields (not filters)", async () => {
    // Note: year and month are now metadata fields representing the latest year,
    // not filters. The view has one row per insee_code with latest year metadata.
    const results = await getAptsByInseeMonthSlopes({
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        // Year and month should be present as metadata
        expectNumber(result.year, "year");
        expectNumber(result.month, "month");
        expect(result.month).toBeGreaterThanOrEqual(1);
        expect(result.month).toBeLessThanOrEqual(12);
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
      });
    }
  });

  it("should work with sorting by slope metrics", async () => {
    const results = await getAptsByInseeMonthSlopes({
      sortBy: "avg_price_m2_slope",
      sortOrder: "desc",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by avg_price_m2_slope descending
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1].avg_price_m2_slope;
        const current = results[i].avg_price_m2_slope;

        if (prev !== null && current !== null) {
          expect(current).toBeLessThanOrEqual(prev);
        }
      }
    }
  });

  it("should work with sorting by window metadata", async () => {
    const results = await getAptsByInseeMonthSlopes({
      sortBy: "window_start_year",
      sortOrder: "asc",
      limit: 20,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by window_start_year ascending
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const current = results[i];

        if (
          prev.window_start_year !== null &&
          current.window_start_year !== null
        ) {
          expect(current.window_start_year).toBeGreaterThanOrEqual(
            prev.window_start_year
          );
        }
      }
    }
  });

  it("should work with sorting by window_months", async () => {
    const results = await getAptsByInseeMonthSlopes({
      sortBy: "window_months",
      sortOrder: "desc",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by window_months descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].window_months).toBeLessThanOrEqual(
          results[i - 1].window_months
        );
      }
    }
  });

  it("should work with temporal sorting (year, month)", async () => {
    const results = await getAptsByInseeMonthSlopes({
      sortBy: "year",
      sortOrder: "asc",
      limit: 20,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by year, then month
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const current = results[i];

        if (prev.year === current.year) {
          expect(current.month).toBeGreaterThanOrEqual(prev.month);
        } else {
          expect(current.year).toBeGreaterThan(prev.year);
        }
      }
    }
  });

  it("should work with pagination", async () => {
    const firstPage = await getAptsByInseeMonthSlopes({
      limit: 5,
      offset: 0,
      sortBy: "total_sales_slope",
    });

    const secondPage = await getAptsByInseeMonthSlopes({
      limit: 5,
      offset: 5,
      sortBy: "total_sales_slope",
    });

    expect(Array.isArray(firstPage)).toBe(true);
    expect(Array.isArray(secondPage)).toBe(true);

    // Results should be different (unless there are fewer than 10 total)
    if (firstPage.length === 5 && secondPage.length > 0) {
      const firstRow = firstPage[0];
      const secondRow = secondPage[0];

      const rowsAreDifferent =
        firstRow.inseeCode !== secondRow.inseeCode ||
        firstRow.year !== secondRow.year ||
        firstRow.month !== secondRow.month;

      if (!rowsAreDifferent) {
        expect(secondPage.length).toBeLessThan(5);
      }
    }
  });

  it("should handle empty results gracefully", async () => {
    const results = await getAptsByInseeMonthSlopes({
      year: 1900, // Very old year that shouldn't have data
      inseeCode: "99999", // Non-existent INSEE code
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsByInseeMonthSlopes({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      // Check base fields are numbers
      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.window_months, "window_months");

      // Check slope metrics are numbers or null
      expectNumberOrNull(result.avg_price_m2_slope, "avg_price_m2_slope");
      expectNumberOrNull(result.total_sales_slope, "total_sales_slope");
      expectNumberOrNull(result.median_price_slope, "median_price_slope");

      // Check apartment composition slopes
      expectNumberOrNull(
        result.total_apartments_slope,
        "total_apartments_slope"
      );
      expectNumberOrNull(
        result.apartment_3_room_slope,
        "apartment_3_room_slope"
      );
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesByInseeMonthSlopes
// ----------------------------------------------------------------------------

describe("getHousesByInseeMonthSlopes", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesByInseeMonthSlopes({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.month, "month");

      expectWindowMetadata(result);
      expectCoreSlopeMetrics(result);
      expectHouseCompositionSlopes(result);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getHousesByInseeMonthSlopes({
      inseeCode: "75118",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
        expectHouseCompositionSlopes(result);
      });
    }
  });

  it("should work with sorting by different slope metrics", async () => {
    const sortOptions = [
      "total_sales_slope",
      "avg_price_m2_slope",
      "total_price_slope",
      "median_price_slope",
    ] as const;

    for (const sortBy of sortOptions) {
      const results = await getHousesByInseeMonthSlopes({
        sortBy,
        sortOrder: "desc",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expectWindowMetadata(results[0]);
        expectCoreSlopeMetrics(results[0]);
      }
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesByInseeMonthSlopes({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.window_months, "window_months");
      expectNumberOrNull(result.total_sales_slope, "total_sales_slope");
      expectNumberOrNull(result.total_houses_slope, "total_houses_slope");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getAptsBySectionMonthSlopes
// ----------------------------------------------------------------------------

describe("getAptsBySectionMonthSlopes", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getAptsBySectionMonthSlopes({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("section");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expect(typeof result.section).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.month, "month");

      expectWindowMetadata(result);
      expectCoreSlopeMetrics(result);
      expectApartmentCompositionSlopes(result);
    }
  });

  it("should work with section filter", async () => {
    const results = await getAptsBySectionMonthSlopes({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
        expectApartmentCompositionSlopes(result);
      });
    }
  });

  it("should work with inseeCode and section filters", async () => {
    const results = await getAptsBySectionMonthSlopes({
      inseeCode: "75118",
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expect(result.section).toBe("000");
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
      });
    }
  });

  it("should return year and month as metadata fields (not filters)", async () => {
    // Note: year and month are now metadata fields representing the latest year,
    // not filters. The view has one row per section with latest year metadata.
    const results = await getAptsBySectionMonthSlopes({
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        // Year and month should be present as metadata
        expectNumber(result.year, "year");
        expectNumber(result.month, "month");
        expect(result.month).toBeGreaterThanOrEqual(1);
        expect(result.month).toBeLessThanOrEqual(12);
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
      });
    }
  });

  it("should work with sorting by section", async () => {
    const results = await getAptsBySectionMonthSlopes({
      sortBy: "section",
      sortOrder: "asc",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by section ascending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].section >= results[i - 1].section).toBe(true);
      }
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsBySectionMonthSlopes({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.window_months, "window_months");
      expectNumberOrNull(result.total_sales_slope, "total_sales_slope");
      expectNumberOrNull(
        result.total_apartments_slope,
        "total_apartments_slope"
      );
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesBySectionMonthSlopes
// ----------------------------------------------------------------------------

describe("getHousesBySectionMonthSlopes", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesBySectionMonthSlopes({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("section");
      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expect(typeof result.section).toBe("string");
      expectNumber(result.year, "year");
      expectNumber(result.month, "month");

      expectWindowMetadata(result);
      expectCoreSlopeMetrics(result);
      expectHouseCompositionSlopes(result);
    }
  });

  it("should work with section filter", async () => {
    const results = await getHousesBySectionMonthSlopes({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
        expectHouseCompositionSlopes(result);
      });
    }
  });

  it("should work with inseeCode and section filters (year/month are metadata)", async () => {
    // Note: year and month are now metadata fields, not filters
    const results = await getHousesBySectionMonthSlopes({
      inseeCode: "75118",
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expect(result.section).toBe("000");
        // Year and month should be present as metadata
        expectNumber(result.year, "year");
        expectNumber(result.month, "month");
        expectWindowMetadata(result);
        expectCoreSlopeMetrics(result);
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesBySectionMonthSlopes({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.window_months, "window_months");
      expectNumberOrNull(result.total_sales_slope, "total_sales_slope");
      expectNumberOrNull(result.total_houses_slope, "total_houses_slope");
    }
  });
});

// ----------------------------------------------------------------------------
// Cross-function tests
// ----------------------------------------------------------------------------

describe("Slopes repository functions - cross-function tests", () => {
  it("should handle all sortBy options correctly", async () => {
    const sortOptions = [
      "inseeCode",
      "year",
      "month",
      "window_start_year",
      "window_start_month",
      "window_months",
      "total_sales_slope",
      "avg_price_m2_slope",
      "median_price_slope",
    ] as const;

    for (const sortBy of sortOptions) {
      const results = await getAptsByInseeMonthSlopes({
        sortBy,
        sortOrder: "desc",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      // Just verify it doesn't throw and returns results
      if (results.length > 0) {
        expectWindowMetadata(results[0]);
        expectCoreSlopeMetrics(results[0]);
      }
    }
  });

  it("should respect limit parameter", async () => {
    const limits = [1, 5, 10, 50];

    for (const limit of limits) {
      const results = await getAptsByInseeMonthSlopes({
        limit,
        offset: 0,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(limit);
    }
  });

  it("should handle pagination correctly", async () => {
    const firstPage = await getAptsByInseeMonthSlopes({
      limit: 10,
      offset: 0,
      sortBy: "total_sales_slope",
    });

    const secondPage = await getAptsByInseeMonthSlopes({
      limit: 10,
      offset: 10,
      sortBy: "total_sales_slope",
    });

    expect(Array.isArray(firstPage)).toBe(true);
    expect(Array.isArray(secondPage)).toBe(true);

    // Results should be different (unless there are fewer than 20 total)
    if (firstPage.length === 10 && secondPage.length > 0) {
      const firstRow = firstPage[0];
      const secondRow = secondPage[0];

      const rowsAreDifferent =
        firstRow.inseeCode !== secondRow.inseeCode ||
        firstRow.year !== secondRow.year ||
        firstRow.month !== secondRow.month;

      if (!rowsAreDifferent) {
        expect(secondPage.length).toBeLessThan(10);
      }
    }
  });

  it("should handle empty results gracefully", async () => {
    const results = await getAptsByInseeMonthSlopes({
      year: 1900, // Very old year that shouldn't have data
      inseeCode: "99999", // Non-existent INSEE code
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should validate month range (1-12)", async () => {
    const results = await getAptsByInseeMonthSlopes({
      month: 6, // Valid month
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.month).toBeGreaterThanOrEqual(1);
        expect(result.month).toBeLessThanOrEqual(12);
      });
    }
  });

  it("should validate window_months range (1-12)", async () => {
    const results = await getAptsByInseeMonthSlopes({
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.window_months).toBeGreaterThanOrEqual(1);
        expect(result.window_months).toBeLessThanOrEqual(12);
      });
    }
  });

  it("should handle null slope values correctly", async () => {
    // Slopes can be null when there's insufficient data for regression
    const results = await getAptsByInseeMonthSlopes({
      limit: 100, // Get more results to find edge cases
    });

    expect(Array.isArray(results)).toBe(true);

    // Verify that null slope values are handled correctly
    results.forEach((result) => {
      expectCoreSlopeMetrics(result);
      expectApartmentCompositionSlopes(result);

      // Check that slope values are either numbers or null
      const totalSalesSlope = result.total_sales_slope;
      expect(
        totalSalesSlope === null || typeof totalSalesSlope === "number"
      ).toBe(true);
    });
  });

  it("should validate window_start_month range when not null", async () => {
    const results = await getAptsByInseeMonthSlopes({
      limit: 50,
    });

    expect(Array.isArray(results)).toBe(true);

    results.forEach((result) => {
      if (result.window_start_month !== null) {
        expect(result.window_start_month).toBeGreaterThanOrEqual(1);
        expect(result.window_start_month).toBeLessThanOrEqual(12);
      }
    });
  });
});
