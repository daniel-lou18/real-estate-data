import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPricePerM2Deciles, getSalesByInseeCode, getSalesSummary, getSalesByPropertyType, getSalesByYear, getSalesByMonth, } from "./analytics.queries";
/**
 * Helper function to check that a value is a number (not a string)
 */
function expectNumber(value, fieldName) {
    expect(typeof value).toBe("number");
    expect(typeof value).not.toBe("string");
    expect(Number.isFinite(value)).toBe(true);
}
/**
 * Helper function to check that a value is a number or null
 */
function expectNumberOrNull(value, fieldName) {
    if (value !== null) {
        expectNumber(value, fieldName);
    }
    else {
        expect(value).toBeNull();
    }
}
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
            // Type check: percentile should be a number
            expectNumber(decile.percentile, "decile.percentile");
            // Type check: value should be a number or null (not a string)
            expectNumberOrNull(decile.value, "decile.value");
        });
        // Check totalTransactions is a number (not a string)
        expectNumber(result.totalTransactions, "totalTransactions");
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
        // Type check: totalTransactions should be a number
        expectNumber(result.totalTransactions, "totalTransactions");
        expect(result.totalTransactions).toBeGreaterThan(0);
        // Check that we have valid decile values
        const validDeciles = result.deciles.filter((d) => d.value !== null);
        expect(validDeciles.length).toBeGreaterThan(0);
        // Type check: all decile values should be numbers or null
        result.deciles.forEach((decile) => {
            expectNumberOrNull(decile.value, "decile.value");
        });
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
        // Type check: totalTransactions should be a number
        expectNumber(result.totalTransactions, "totalTransactions");
        // Check that we have valid decile values (may be 0 if no data for this section)
        const validDeciles = result.deciles.filter((d) => d.value !== null);
        // Type check: all decile values should be numbers or null
        result.deciles.forEach((decile) => {
            expectNumberOrNull(decile.value, "decile.value");
        });
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
        // Type check: totalTransactions should be a number (0, not "0")
        expectNumber(result.totalTransactions, "totalTransactions");
        expect(result.totalTransactions).toBe(0);
        // All decile values should be null when no data
        result.deciles.forEach((decile) => {
            expect(decile.value).toBeNull();
        });
    });
});
describe("getSalesByInseeCode", () => {
    it("should return numeric values as numbers, not strings", async () => {
        const results = await getSalesByInseeCode({
            limit: 5,
            offset: 0,
            sortOrder: "desc",
        });
        if (results.length > 0) {
            const result = results[0];
            // Check base aggregation fields are numbers
            expectNumber(result.count, "count");
            expectNumber(result.totalPrice, "totalPrice");
            expectNumber(result.avgPrice, "avgPrice");
            expectNumber(result.minPrice, "minPrice");
            expectNumber(result.maxPrice, "maxPrice");
            expectNumber(result.totalFloorArea, "totalFloorArea");
            expectNumber(result.avgFloorArea, "avgFloorArea");
            expectNumberOrNull(result.avgPricePerM2, "avgPricePerM2");
            // Check property type fields are numbers
            expectNumber(result.totalProperties, "totalProperties");
            expectNumber(result.totalApartments, "totalApartments");
            expectNumber(result.totalHouses, "totalHouses");
            expectNumber(result.totalWorkspaces, "totalWorkspaces");
            expectNumber(result.totalSecondaryUnits, "totalSecondaryUnits");
            // Check apartment-specific fields are numbers
            expectNumber(result.apartmentTransactionCount, "apartmentTransactionCount");
            expectNumber(result.apartmentTotalPrice, "apartmentTotalPrice");
            expectNumber(result.apartmentAvgPrice, "apartmentAvgPrice");
            expectNumber(result.apartmentTotalFloorArea, "apartmentTotalFloorArea");
            expectNumber(result.apartmentAvgFloorArea, "apartmentAvgFloorArea");
            expectNumberOrNull(result.apartmentAvgPricePerM2, "apartmentAvgPricePerM2");
            // Check house-specific fields are numbers
            expectNumber(result.houseTransactionCount, "houseTransactionCount");
            expectNumber(result.houseTotalPrice, "houseTotalPrice");
            expectNumber(result.houseAvgPrice, "houseAvgPrice");
            expectNumber(result.houseTotalFloorArea, "houseTotalFloorArea");
            expectNumber(result.houseAvgFloorArea, "houseAvgFloorArea");
            expectNumberOrNull(result.houseAvgPricePerM2, "houseAvgPricePerM2");
            // Check room distribution fields are numbers
            expectNumber(result.apt1Room, "apt1Room");
            expectNumber(result.apt2Room, "apt2Room");
            expectNumber(result.apt3Room, "apt3Room");
            expectNumber(result.apt4Room, "apt4Room");
            expectNumber(result.apt5Room, "apt5Room");
            expectNumber(result.house1Room, "house1Room");
            expectNumber(result.house2Room, "house2Room");
            expectNumber(result.house3Room, "house3Room");
            expectNumber(result.house4Room, "house4Room");
            expectNumber(result.house5Room, "house5Room");
        }
    });
});
describe("getSalesSummary", () => {
    it("should return numeric values as numbers, not strings", async () => {
        const result = await getSalesSummary();
        // Check base aggregation fields are numbers
        expectNumber(result.count, "count");
        expectNumber(result.totalPrice, "totalPrice");
        expectNumber(result.avgPrice, "avgPrice");
        expectNumber(result.minPrice, "minPrice");
        expectNumber(result.maxPrice, "maxPrice");
        expectNumber(result.totalFloorArea, "totalFloorArea");
        expectNumber(result.avgFloorArea, "avgFloorArea");
        expectNumberOrNull(result.avgPricePerM2, "avgPricePerM2");
        // Check property type fields are numbers
        expectNumber(result.totalProperties, "totalProperties");
        expectNumber(result.totalApartments, "totalApartments");
        expectNumber(result.totalHouses, "totalHouses");
        expectNumber(result.totalWorkspaces, "totalWorkspaces");
        expectNumber(result.totalSecondaryUnits, "totalSecondaryUnits");
        // Check optional summary fields
        if (result.uniqueDepartments !== undefined) {
            expectNumber(result.uniqueDepartments, "uniqueDepartments");
        }
        if (result.uniqueInseeCodes !== undefined) {
            expectNumber(result.uniqueInseeCodes, "uniqueInseeCodes");
        }
    });
});
describe("getSalesByPropertyType", () => {
    it("should return numeric values as numbers, not strings", async () => {
        const results = await getSalesByPropertyType({
            limit: 5,
            offset: 0,
            sortOrder: "desc",
        });
        if (results.length > 0) {
            const result = results[0];
            // Check base aggregation fields are numbers
            expectNumber(result.count, "count");
            expectNumber(result.totalPrice, "totalPrice");
            expectNumber(result.avgPrice, "avgPrice");
            expectNumber(result.minPrice, "minPrice");
            expectNumber(result.maxPrice, "maxPrice");
            expectNumber(result.totalFloorArea, "totalFloorArea");
            expectNumber(result.avgFloorArea, "avgFloorArea");
            expectNumberOrNull(result.avgPricePerM2, "avgPricePerM2");
            // Check property type code is a number
            expectNumber(result.propertyTypeCode, "propertyTypeCode");
        }
    });
});
describe("getSalesByYear", () => {
    it("should return numeric values as numbers, not strings", async () => {
        const results = await getSalesByYear({
            limit: 5,
            offset: 0,
            sortOrder: "desc",
        });
        if (results.length > 0) {
            const result = results[0];
            // Check year is a number
            expectNumber(result.year, "year");
            // Check base aggregation fields are numbers
            expectNumber(result.count, "count");
            expectNumber(result.totalPrice, "totalPrice");
            expectNumber(result.avgPrice, "avgPrice");
            expectNumber(result.minPrice, "minPrice");
            expectNumber(result.maxPrice, "maxPrice");
            expectNumber(result.totalFloorArea, "totalFloorArea");
            expectNumber(result.avgFloorArea, "avgFloorArea");
            expectNumberOrNull(result.avgPricePerM2, "avgPricePerM2");
            // Check property type fields are numbers
            expectNumber(result.totalProperties, "totalProperties");
            expectNumber(result.totalApartments, "totalApartments");
            expectNumber(result.totalHouses, "totalHouses");
            expectNumber(result.totalWorkspaces, "totalWorkspaces");
            expectNumber(result.totalSecondaryUnits, "totalSecondaryUnits");
        }
    });
});
describe("getSalesByMonth", () => {
    it("should return numeric values as numbers, not strings", async () => {
        const results = await getSalesByMonth({
            limit: 5,
            offset: 0,
            sortOrder: "desc",
        });
        if (results.length > 0) {
            const result = results[0];
            // Check year and month are numbers
            expectNumber(result.year, "year");
            expectNumber(result.month, "month");
            // Check base aggregation fields are numbers
            expectNumber(result.count, "count");
            expectNumber(result.totalPrice, "totalPrice");
            expectNumber(result.avgPrice, "avgPrice");
            expectNumber(result.minPrice, "minPrice");
            expectNumber(result.maxPrice, "maxPrice");
            expectNumber(result.totalFloorArea, "totalFloorArea");
            expectNumber(result.avgFloorArea, "avgFloorArea");
            expectNumberOrNull(result.avgPricePerM2, "avgPricePerM2");
            // Check property type fields are numbers
            expectNumber(result.totalProperties, "totalProperties");
            expectNumber(result.totalApartments, "totalApartments");
            expectNumber(result.totalHouses, "totalHouses");
            expectNumber(result.totalWorkspaces, "totalWorkspaces");
            expectNumber(result.totalSecondaryUnits, "totalSecondaryUnits");
        }
    });
});
