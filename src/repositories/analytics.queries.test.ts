import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPricePerM2Deciles } from "./analytics.queries";

describe("getPricePerM2Deciles", () => {
  beforeAll(async () => {
    // Ensure we have some test data
    // This assumes the database already has data
  });

  afterAll(async () => {
    // Clean up if needed
  });

  it("should work with no parameters", async () => {
    const result = await getPricePerM2Deciles();

    // Check the structure
    expect(result).toHaveProperty("deciles");
    expect(result).toHaveProperty("totalTransactions");

    // Check deciles array
    expect(Array.isArray(result.deciles)).toBe(true);
    expect(result.deciles).toHaveLength(10);

    // Check each decile has the correct structure
    result.deciles.forEach((decile, index) => {
      expect(decile).toHaveProperty("percentile");
      expect(decile).toHaveProperty("value");
      expect(decile.percentile).toBe((index + 1) * 10); // 10, 20, 30, ..., 100
    });

    // Check totalTransactions is a number
    expect(typeof result.totalTransactions).toBe("number");
    expect(result.totalTransactions).toBeGreaterThan(0);

    // Check that decile values are in ascending order
    for (let i = 1; i < result.deciles.length; i++) {
      const prevValue = result.deciles[i - 1].value;
      const currentValue = result.deciles[i].value;

      if (prevValue !== null && currentValue !== null) {
        expect(currentValue).toBeGreaterThanOrEqual(prevValue);
      }
    }
  });

  it("should work with inseeCode parameter", async () => {
    const result = await getPricePerM2Deciles({
      inseeCode: "75118", // Paris 18th arrondissement
    });

    // Check the structure
    expect(result).toHaveProperty("deciles");
    expect(result).toHaveProperty("totalTransactions");
    expect(result.totalTransactions).toBeGreaterThan(0);

    // Check that we have valid decile values
    const validDeciles = result.deciles.filter((d) => d.value !== null);
    expect(validDeciles.length).toBeGreaterThan(0);

    // Check that decile values are in ascending order
    for (let i = 1; i < result.deciles.length; i++) {
      const prevValue = result.deciles[i - 1].value;
      const currentValue = result.deciles[i].value;

      if (prevValue !== null && currentValue !== null) {
        expect(currentValue).toBeGreaterThanOrEqual(prevValue);
      }
    }
  });

  it("should work with inseeCode and section parameters", async () => {
    const result = await getPricePerM2Deciles({
      inseeCode: "75118", // Paris 18th arrondissement
      section: "000", // Section code
    });

    // Check the structure
    expect(result).toHaveProperty("deciles");
    expect(result).toHaveProperty("totalTransactions");

    // Check that we have valid decile values (may be 0 if no data for this section)
    const validDeciles = result.deciles.filter((d) => d.value !== null);

    // If we have data, check the structure
    if (result.totalTransactions > 0) {
      expect(validDeciles.length).toBeGreaterThan(0);

      // Check that decile values are in ascending order
      for (let i = 1; i < result.deciles.length; i++) {
        const prevValue = result.deciles[i - 1].value;
        const currentValue = result.deciles[i].value;

        if (prevValue !== null && currentValue !== null) {
          expect(currentValue).toBeGreaterThanOrEqual(prevValue);
        }
      }
    }
  });

  it("should handle empty results gracefully", async () => {
    // Test with parameters that should return no results
    const result = await getPricePerM2Deciles({
      year: 1900, // Very old year that shouldn't have data
      inseeCode: "99999", // Non-existent INSEE code
    });

    expect(result).toHaveProperty("deciles");
    expect(result).toHaveProperty("totalTransactions");
    expect(result.totalTransactions).toBe(0);

    // All decile values should be null when no data
    result.deciles.forEach((decile) => {
      expect(decile.value).toBeNull();
    });
  });
});
