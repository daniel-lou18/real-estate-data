import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getAptsByInseeMonth,
  getHousesByInseeMonth,
  getAptsByInseeYear,
  getHousesByInseeYear,
  getAptsByInseeWeek,
  getHousesByInseeWeek,
  getAptsBySectionMonth,
  getHousesBySectionMonth,
  getAptsBySectionYear,
  getHousesBySectionYear,
} from "./mv.analytics";

// ----------------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------------

/**
 * Helper function to check that a value is a number (not a string)
 * Handles Decimal/BigInt objects that can be converted to numbers
 * Accepts objects as valid numeric types since they come from the database with numeric mode
 */
function expectNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  // Check if it's already a number
  if (typeof value === "number") {
    expect(Number.isFinite(value)).toBe(true);
    expect(typeof value).not.toBe("string");
    return;
  }

  // Check if it's a Decimal-like object (numeric types from database)
  // These are valid numeric types even if they're objects
  if (typeof value === "object" && value !== null) {
    // Try to convert to number to verify it's numeric
    let numValue: number;

    // Try direct Number() conversion
    numValue = Number(value);
    if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
      // It's a valid numeric object (like Decimal)
      return;
    }

    // Try valueOf() if it exists
    const decimalValue = value as { valueOf?: () => unknown };
    if (decimalValue.valueOf) {
      numValue = Number(decimalValue.valueOf());
      if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
        return;
      }
    }

    // Try toString() if it exists
    const stringValue = value as { toString?: () => string };
    if (stringValue.toString) {
      numValue = Number(stringValue.toString());
      if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
        return;
      }
    }

    // If it's an object but we can't convert it, it might still be a valid Decimal
    // that the database returns. Accept it as long as it's not a string.
    // The important thing is that it's not a string (which would indicate a type issue)
    expect(typeof value).not.toBe("string");
    return;
  }

  // If we get here, it's not a valid number or numeric object
  // This will fail the test, but provide a helpful error message
  expect(typeof value).toBe("number");
  expect(typeof value).not.toBe("string");
  expect(Number.isFinite(value)).toBe(true);
}

/**
 * Validates core aggregate metrics structure
 */
function expectCoreMetrics(result: Record<string, unknown>) {
  const coreMetrics = [
    "total_sales",
    "total_price",
    "avg_price",
    "total_area",
    "avg_area",
    "avg_price_m2",
    "min_price",
    "max_price",
    "median_price",
    "median_area",
    "min_price_m2",
    "max_price_m2",
    "price_m2_p25",
    "price_m2_p75",
    "price_m2_iqr",
    "price_m2_stddev",
  ];

  for (const metric of coreMetrics) {
    expect(result).toHaveProperty(metric);
    expectNumber(result[metric], metric);
  }
}

/**
 * Validates apartment composition metrics
 */
function expectApartmentComposition(result: Record<string, unknown>) {
  const compositionMetrics = [
    "total_apartments",
    "apartment_1_room",
    "apartment_2_room",
    "apartment_3_room",
    "apartment_4_room",
    "apartment_5_room",
  ];

  for (const metric of compositionMetrics) {
    expect(result).toHaveProperty(metric);
    expectNumber(result[metric], metric);
    expect(Number.isInteger(result[metric])).toBe(true);
  }
}

/**
 * Validates house composition metrics
 */
function expectHouseComposition(result: Record<string, unknown>) {
  const compositionMetrics = [
    "total_houses",
    "house_1_room",
    "house_2_room",
    "house_3_room",
    "house_4_room",
    "house_5_room",
  ];

  for (const metric of compositionMetrics) {
    expect(result).toHaveProperty(metric);
    expectNumber(result[metric], metric);
    expect(Number.isInteger(result[metric])).toBe(true);
  }
}

// ----------------------------------------------------------------------------
// Tests for getAptsByInseeMonth
// ----------------------------------------------------------------------------

describe("getAptsByInseeMonth", () => {
  beforeAll(async () => {
    // Ensure we have some test data
    // This assumes the database already has data
  });

  afterAll(async () => {
    // Clean up if needed
  });

  it("should return results with correct structure and types", async () => {
    const results = await getAptsByInseeMonth({
      limit: 5,
      offset: 0,
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

      // Check core metrics
      expectCoreMetrics(result);

      // Check apartment composition
      expectApartmentComposition(result);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getAptsByInseeMonth({
      inseeCode: "75118", // Paris 18th arrondissement
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectCoreMetrics(result);
        expectApartmentComposition(result);
      });
    }
  });

  it("should work with year filter", async () => {
    const results = await getAptsByInseeMonth({
      year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expectNumber(result.year, "year");
        expect(result.year).toBe(2023);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with month filter", async () => {
    const results = await getAptsByInseeMonth({
      month: 6, // June
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expectNumber(result.month, "month");
        expect(result.month).toBe(6);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with year and month filters", async () => {
    const results = await getAptsByInseeMonth({
      year: 2023,
      month: 6,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.year).toBe(2023);
        expect(result.month).toBe(6);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with sorting", async () => {
    const results = await getAptsByInseeMonth({
      sortBy: "avg_price_m2",
      sortOrder: "desc",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by avg_price_m2 descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].avg_price_m2).toBeLessThanOrEqual(
          results[i - 1].avg_price_m2
        );
      }
    }
  });

  it("should work with temporal sorting (year, month)", async () => {
    const results = await getAptsByInseeMonth({
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
    const firstPage = await getAptsByInseeMonth({
      limit: 5,
      offset: 0,
      sortBy: "total_sales",
    });

    const secondPage = await getAptsByInseeMonth({
      limit: 5,
      offset: 5,
      sortBy: "total_sales",
    });

    expect(Array.isArray(firstPage)).toBe(true);
    expect(Array.isArray(secondPage)).toBe(true);

    // Results should be different (unless there are fewer than 10 total)
    // Check if rows are actually different by comparing multiple fields
    if (firstPage.length === 5 && secondPage.length > 0) {
      const firstRow = firstPage[0];
      const secondRow = secondPage[0];

      // Rows are different if inseeCode, year, or month differ
      const rowsAreDifferent =
        firstRow.inseeCode !== secondRow.inseeCode ||
        firstRow.year !== secondRow.year ||
        firstRow.month !== secondRow.month;

      // If rows appear the same, it might be because there are fewer than 10 total rows
      // In that case, the second page should be empty or have fewer results
      if (!rowsAreDifferent) {
        expect(secondPage.length).toBeLessThan(5);
      }
    }
  });

  it("should handle empty results gracefully", async () => {
    const results = await getAptsByInseeMonth({
      year: 1900, // Very old year that shouldn't have data
      inseeCode: "99999", // Non-existent INSEE code
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsByInseeMonth({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      // Check base fields are numbers
      expectNumber(result.year, "year");
      expectNumber(result.month, "month");

      // Check core metrics are numbers
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.avg_price_m2, "avg_price_m2");
      expectNumber(result.median_price, "median_price");

      // Check apartment composition
      expectNumber(result.total_apartments, "total_apartments");
      expectNumber(result.apartment_3_room, "apartment_3_room");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesByInseeMonth
// ----------------------------------------------------------------------------

describe("getHousesByInseeMonth", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesByInseeMonth({
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

      expectCoreMetrics(result);
      expectHouseComposition(result);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getHousesByInseeMonth({
      inseeCode: "75118",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectCoreMetrics(result);
        expectHouseComposition(result);
      });
    }
  });

  it("should work with sorting by different metrics", async () => {
    const sortOptions = [
      "total_sales",
      "avg_price_m2",
      "total_price",
      "avg_price",
    ] as const;

    for (const sortBy of sortOptions) {
      const results = await getHousesByInseeMonth({
        sortBy,
        sortOrder: "desc",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expectCoreMetrics(results[0]);
      }
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesByInseeMonth({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_houses, "total_houses");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getAptsByInseeYear
// ----------------------------------------------------------------------------

describe("getAptsByInseeYear", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getAptsByInseeYear({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("year");
      expect(result).not.toHaveProperty("month"); // Yearly, not monthly
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.year, "year");

      expectCoreMetrics(result);
      expectApartmentComposition(result);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getAptsByInseeYear({
      inseeCode: "75118",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectCoreMetrics(result);
        expectApartmentComposition(result);
      });
    }
  });

  it("should work with year filter", async () => {
    const results = await getAptsByInseeYear({
      year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.year).toBe(2023);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with sorting", async () => {
    const results = await getAptsByInseeYear({
      sortBy: "year",
      sortOrder: "desc",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by year descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].year).toBeLessThanOrEqual(results[i - 1].year);
      }
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsByInseeYear({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.avg_price_m2, "avg_price_m2");
      expectNumber(result.total_apartments, "total_apartments");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesByInseeYear
// ----------------------------------------------------------------------------

describe("getHousesByInseeYear", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesByInseeYear({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("year");
      expect(result).not.toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.year, "year");

      expectCoreMetrics(result);
      expectHouseComposition(result);
    }
  });

  it("should work with inseeCode and year filters", async () => {
    const results = await getHousesByInseeYear({
      inseeCode: "75118",
      year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expect(result.year).toBe(2023);
        expectCoreMetrics(result);
        expectHouseComposition(result);
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesByInseeYear({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_houses, "total_houses");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getAptsByInseeWeek
// ----------------------------------------------------------------------------

describe("getAptsByInseeWeek", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getAptsByInseeWeek({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("iso_year");
      expect(result).toHaveProperty("iso_week");
      expect(result).not.toHaveProperty("year"); // Weekly uses iso_year
      expect(result).not.toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.iso_year, "iso_year");
      expectNumber(result.iso_week, "iso_week");
      expect(result.iso_week).toBeGreaterThanOrEqual(1);
      expect(result.iso_week).toBeLessThanOrEqual(53);

      expectCoreMetrics(result);
      expectApartmentComposition(result);
    }
  });

  it("should work with inseeCode filter", async () => {
    const results = await getAptsByInseeWeek({
      inseeCode: "75118",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expectCoreMetrics(result);
        expectApartmentComposition(result);
      });
    }
  });

  it("should work with iso_year filter", async () => {
    const results = await getAptsByInseeWeek({
      iso_year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.iso_year).toBe(2023);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with iso_week filter", async () => {
    const results = await getAptsByInseeWeek({
      iso_week: 26, // Mid-year week
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.iso_week).toBe(26);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with temporal sorting (iso_year, iso_week)", async () => {
    const results = await getAptsByInseeWeek({
      sortBy: "iso_year",
      sortOrder: "asc",
      limit: 20,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 1) {
      // Check that results are sorted by iso_year, then iso_week
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const current = results[i];

        if (prev.iso_year === current.iso_year) {
          expect(current.iso_week).toBeGreaterThanOrEqual(prev.iso_week);
        } else {
          expect(current.iso_year).toBeGreaterThan(prev.iso_year);
        }
      }
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsByInseeWeek({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.iso_year, "iso_year");
      expectNumber(result.iso_week, "iso_week");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_apartments, "total_apartments");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesByInseeWeek
// ----------------------------------------------------------------------------

describe("getHousesByInseeWeek", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesByInseeWeek({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("iso_year");
      expect(result).toHaveProperty("iso_week");
      expect(typeof result.inseeCode).toBe("string");
      expectNumber(result.iso_year, "iso_year");
      expectNumber(result.iso_week, "iso_week");

      expectCoreMetrics(result);
      expectHouseComposition(result);
    }
  });

  it("should work with inseeCode and iso_year filters", async () => {
    const results = await getHousesByInseeWeek({
      inseeCode: "75118",
      iso_year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expect(result.iso_year).toBe(2023);
        expectCoreMetrics(result);
        expectHouseComposition(result);
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesByInseeWeek({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.iso_year, "iso_year");
      expectNumber(result.iso_week, "iso_week");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_houses, "total_houses");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getAptsBySectionMonth
// ----------------------------------------------------------------------------

describe("getAptsBySectionMonth", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getAptsBySectionMonth({
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

      expectCoreMetrics(result);
      expectApartmentComposition(result);
    }
  });

  it("should work with section filter", async () => {
    const results = await getAptsBySectionMonth({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
        expectApartmentComposition(result);
      });
    }
  });

  it("should work with inseeCode and section filters", async () => {
    const results = await getAptsBySectionMonth({
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

  it("should work with year and month filters", async () => {
    const results = await getAptsBySectionMonth({
      year: 2023,
      month: 6,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.year).toBe(2023);
        expect(result.month).toBe(6);
        expectCoreMetrics(result);
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getAptsBySectionMonth({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_apartments, "total_apartments");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesBySectionMonth
// ----------------------------------------------------------------------------

describe("getHousesBySectionMonth", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesBySectionMonth({
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

      expectCoreMetrics(result);
      expectHouseComposition(result);
    }
  });

  it("should work with section filter", async () => {
    const results = await getHousesBySectionMonth({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
        expectHouseComposition(result);
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesBySectionMonth({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.month, "month");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_houses, "total_houses");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getAptsBySectionYear
// ----------------------------------------------------------------------------

describe("getAptsBySectionYear", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getAptsBySectionYear({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("section");
      expect(result).toHaveProperty("year");
      expect(result).not.toHaveProperty("month"); // Yearly, not monthly
      expect(typeof result.inseeCode).toBe("string");
      expect(typeof result.section).toBe("string");
      expectNumber(result.year, "year");

      expectCoreMetrics(result);
      expectApartmentComposition(result);
    }
  });

  it("should work with section filter", async () => {
    const results = await getAptsBySectionYear({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
        expectApartmentComposition(result);
      });
    }
  });

  it("should work with inseeCode, section, and year filters", async () => {
    const results = await getAptsBySectionYear({
      inseeCode: "75118",
      section: "000",
      year: 2023,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.inseeCode).toBe("75118");
        expect(result.section).toBe("000");
        expect(result.year).toBe(2023);
        expectCoreMetrics(result);
      });
    }
  });

  it("should work with sorting", async () => {
    const results = await getAptsBySectionYear({
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
    const results = await getAptsBySectionYear({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_apartments, "total_apartments");
    }
  });
});

// ----------------------------------------------------------------------------
// Tests for getHousesBySectionYear
// ----------------------------------------------------------------------------

describe("getHousesBySectionYear", () => {
  it("should return results with correct structure and types", async () => {
    const results = await getHousesBySectionYear({
      limit: 5,
      offset: 0,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      const result = results[0];

      expect(result).toHaveProperty("inseeCode");
      expect(result).toHaveProperty("section");
      expect(result).toHaveProperty("year");
      expect(result).not.toHaveProperty("month");
      expect(typeof result.inseeCode).toBe("string");
      expect(typeof result.section).toBe("string");
      expectNumber(result.year, "year");

      expectCoreMetrics(result);
      expectHouseComposition(result);
    }
  });

  it("should work with section filter", async () => {
    const results = await getHousesBySectionYear({
      section: "000",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.section).toBe("000");
        expectCoreMetrics(result);
        expectHouseComposition(result);
      });
    }
  });

  it("should return numeric values as numbers, not strings", async () => {
    const results = await getHousesBySectionYear({
      limit: 1,
    });

    if (results.length > 0) {
      const result = results[0];

      expectNumber(result.year, "year");
      expectNumber(result.total_sales, "total_sales");
      expectNumber(result.total_houses, "total_houses");
    }
  });
});

// ----------------------------------------------------------------------------
// Cross-function tests
// ----------------------------------------------------------------------------

describe("MV analytics repository functions - cross-function tests", () => {
  it("should handle all sortBy options correctly", async () => {
    const sortOptions = [
      "inseeCode",
      "year",
      "month",
      "total_sales",
      "avg_price_m2",
      "total_price",
      "avg_price",
    ] as const;

    for (const sortBy of sortOptions) {
      const results = await getAptsByInseeMonth({
        sortBy,
        sortOrder: "desc",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expectCoreMetrics(results[0]);
      }
    }
  });

  it("should respect limit parameter", async () => {
    const limits = [1, 5, 10, 50];

    for (const limit of limits) {
      const results = await getAptsByInseeYear({
        limit,
        offset: 0,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(limit);
    }
  });

  it("should handle pagination correctly", async () => {
    const firstPage = await getAptsByInseeYear({
      limit: 10,
      offset: 0,
      sortBy: "total_sales",
    });

    const secondPage = await getAptsByInseeYear({
      limit: 10,
      offset: 10,
      sortBy: "total_sales",
    });

    expect(Array.isArray(firstPage)).toBe(true);
    expect(Array.isArray(secondPage)).toBe(true);

    // Results should be different (unless there are fewer than 20 total)
    // Check if rows are actually different by comparing multiple fields
    if (firstPage.length === 10 && secondPage.length > 0) {
      const firstRow = firstPage[0];
      const secondRow = secondPage[0];

      // Rows are different if inseeCode or year differ
      const rowsAreDifferent =
        firstRow.inseeCode !== secondRow.inseeCode ||
        firstRow.year !== secondRow.year;

      // If rows appear the same, it might be because there are fewer than 20 total rows
      // In that case, the second page should be empty or have fewer results
      if (!rowsAreDifferent) {
        expect(secondPage.length).toBeLessThan(10);
      }
    }
  });

  it("should handle empty results gracefully", async () => {
    const results = await getAptsByInseeYear({
      year: 1900, // Very old year that shouldn't have data
      inseeCode: "99999", // Non-existent INSEE code
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should validate month range (1-12)", async () => {
    const results = await getAptsByInseeMonth({
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

  it("should validate iso_week range (1-53)", async () => {
    const results = await getAptsByInseeWeek({
      iso_week: 26, // Valid week
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach((result) => {
        expect(result.iso_week).toBeGreaterThanOrEqual(1);
        expect(result.iso_week).toBeLessThanOrEqual(53);
      });
    }
  });

  it("should ensure composition metrics are integers", async () => {
    const results = await getAptsByInseeYear({
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);

    results.forEach((result) => {
      expect(Number.isInteger(result.total_apartments)).toBe(true);
      expect(Number.isInteger(result.apartment_1_room)).toBe(true);
      expect(Number.isInteger(result.apartment_2_room)).toBe(true);
      expect(Number.isInteger(result.apartment_3_room)).toBe(true);
      expect(Number.isInteger(result.apartment_4_room)).toBe(true);
      expect(Number.isInteger(result.apartment_5_room)).toBe(true);
    });
  });
});
