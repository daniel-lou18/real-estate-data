import { describe, it, expect } from "vitest";
import { sql } from "drizzle-orm";
import { COLUMN_MAP, normalizePagination, compileFilters, compileSort, compileSelect, compileGroupBy, compileMetrics, compileComputations, } from "./mappers";
describe("mappers", () => {
    describe("COLUMN_MAP", () => {
        it("should contain all expected column mappings", () => {
            const expectedColumns = [
                "date",
                "year",
                "month",
                "primaryInseeCode",
                "primarySection",
                "price",
                "nbProperties",
                "nbHouses",
                "nbApartments",
                "nbWorkspaces",
                "nbSecondaryUnits",
                "nbapt1pp",
                "nbapt2pp",
                "nbapt3pp",
                "nbapt4pp",
                "nbapt5pp",
                "nbmai1pp",
                "nbmai2pp",
                "nbmai3pp",
                "nbmai4pp",
                "nbmai5pp",
                "floorArea",
                "ApartmentFloorArea",
                "HouseFloorArea",
                "WorkspaceFloorArea",
                "sapt1pp",
                "sapt2pp",
                "sapt3pp",
                "sapt4pp",
                "sapt5pp",
                "smai1pp",
                "smai2pp",
                "smai3pp",
                "smai4pp",
                "smai5pp",
                "propertyTypeCode",
                "propertyTypeLabel",
            ];
            expectedColumns.forEach((column) => {
                expect(COLUMN_MAP[column]).toBeDefined();
            });
        });
    });
    describe("normalizePagination", () => {
        it("should return default values when no parameters provided", () => {
            const result = normalizePagination();
            expect(result).toEqual({ limit: 50, offset: 0 });
        });
        it("should cap limit to maximum of 500", () => {
            const result = normalizePagination(1000);
            expect(result).toEqual({ limit: 500, offset: 0 });
        });
        it("should set default values when limit is 0", () => {
            const result = normalizePagination(0);
            expect(result).toEqual({ limit: 50, offset: 0 });
        });
        it("should set minimum offset to 0", () => {
            const result = normalizePagination(50, -10);
            expect(result).toEqual({ limit: 50, offset: 0 });
        });
        it("should preserve valid values", () => {
            const result = normalizePagination(100, 25);
            expect(result).toEqual({ limit: 100, offset: 25 });
        });
        it("should handle undefined values", () => {
            const result = normalizePagination(undefined, undefined);
            expect(result).toEqual({ limit: 50, offset: 0 });
        });
    });
    describe("compileFilters", () => {
        it("should return undefined for empty filters", () => {
            const result = compileFilters([]);
            expect(result).toBeUndefined();
        });
        it("should compile equality filter", () => {
            const filters = [
                { field: "price", operator: "=", value: 100000 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile inequality filter", () => {
            const filters = [
                { field: "price", operator: "!=", value: 100000 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile greater than filter", () => {
            const filters = [
                { field: "price", operator: ">", value: 100000 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile greater than or equal filter", () => {
            const filters = [
                { field: "price", operator: ">=", value: 100000 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile less than filter", () => {
            const filters = [
                { field: "price", operator: "<", value: 100000 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile less than or equal filter", () => {
            const filters = [
                { field: "price", operator: "<=", value: 100000 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile between filter", () => {
            const filters = [
                {
                    field: "price",
                    operator: "between",
                    value: [100000, 200000],
                },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should throw error for invalid between filter", () => {
            const filters = [
                {
                    field: "price",
                    operator: "between",
                    value: [100000], // Invalid: should be array of 2 elements
                },
            ];
            expect(() => compileFilters(filters)).toThrow("between requires [min, max]");
        });
        it("should compile in filter", () => {
            const filters = [
                {
                    field: "propertyTypeCode",
                    operator: "in",
                    value: ["A", "B", "C"],
                },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should throw error for invalid in filter", () => {
            const filters = [
                {
                    field: "propertyTypeCode",
                    operator: "in",
                    value: "not an array",
                },
            ];
            expect(() => compileFilters(filters)).toThrow("in requires an array value");
        });
        it("should compile ilike filter", () => {
            const filters = [
                {
                    field: "propertyTypeLabel",
                    operator: "ilike",
                    value: "%house%",
                },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile is_null filter", () => {
            const filters = [
                {
                    field: "price",
                    operator: "is_null",
                    value: true,
                },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should compile not null filter", () => {
            const filters = [
                {
                    field: "price",
                    operator: "is_null",
                    value: false,
                },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
        it("should throw error for unsupported operator", () => {
            const filters = [
                {
                    field: "price",
                    operator: "invalid",
                    value: 100000,
                },
            ];
            expect(() => compileFilters(filters)).toThrow("Unsupported operator: invalid");
        });
        it("should throw error for unsupported field", () => {
            const filters = [
                {
                    field: "invalidField",
                    operator: "=",
                    value: 100000,
                },
            ];
            expect(() => compileFilters(filters)).toThrow("Unsupported filter field: invalidField");
        });
        it("should handle multiple filters", () => {
            const filters = [
                { field: "price", operator: ">", value: 100000 },
                { field: "year", operator: "=", value: 2023 },
            ];
            const result = compileFilters(filters);
            expect(result).toBeDefined();
        });
    });
    describe("compileSort", () => {
        it("should return undefined for empty sort", () => {
            const result = compileSort([]);
            expect(result).toBeUndefined();
        });
        it("should return undefined for undefined sort", () => {
            const result = compileSort(undefined);
            expect(result).toBeUndefined();
        });
        it("should compile single sort field", () => {
            const sort = [{ field: "price", dir: "asc" }];
            const result = compileSort(sort);
            expect(result).toBeDefined();
            expect(result).toHaveLength(1);
        });
        it("should compile multiple sort fields", () => {
            const sort = [
                { field: "price", dir: "desc" },
                { field: "date", dir: "asc" },
            ];
            const result = compileSort(sort);
            expect(result).toBeDefined();
            expect(result).toHaveLength(2);
        });
        it("should default to asc when dir is not specified", () => {
            const sort = [{ field: "price" }];
            const result = compileSort(sort);
            expect(result).toBeDefined();
        });
        it("should throw error for unsupported sort field", () => {
            const sort = [{ field: "invalidField", dir: "asc" }];
            expect(() => compileSort(sort)).toThrow("Unsupported sort field: invalidField");
        });
    });
    describe("compileSelect", () => {
        it("should return undefined for empty select", () => {
            const result = compileSelect([]);
            expect(result).toBeUndefined();
        });
        it("should return undefined for undefined select", () => {
            const result = compileSelect(undefined);
            expect(result).toBeUndefined();
        });
        it("should compile single select field", () => {
            const select = ["price"];
            const result = compileSelect(select);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("price");
        });
        it("should compile multiple select fields", () => {
            const select = [
                "price",
                "date",
                "year",
            ];
            const result = compileSelect(select);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("price");
            expect(result).toHaveProperty("date");
            expect(result).toHaveProperty("year");
        });
        it("should throw error for unsupported select field", () => {
            const select = ["invalidField"];
            expect(() => compileSelect(select)).toThrow("Unsupported select field: invalidField");
        });
    });
    describe("compileGroupBy", () => {
        it("should compile single group by field", () => {
            const groupBy = ["date"];
            const result = compileGroupBy(groupBy);
            expect(result).toBeDefined();
            expect(result).toHaveLength(1);
        });
        it("should compile multiple group by fields", () => {
            const groupBy = [
                "date",
                "year",
            ];
            const result = compileGroupBy(groupBy);
            expect(result).toBeDefined();
            expect(result).toHaveLength(2);
        });
        it("should throw error for unsupported group by field", () => {
            const groupBy = ["invalidField"];
            expect(() => compileGroupBy(groupBy)).toThrow("Unsupported group by: invalidField");
        });
    });
    describe("compileMetrics", () => {
        it("should compile count metric", () => {
            const metrics = [
                { metric: "count", field: "price" },
            ];
            const result = compileMetrics(metrics);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("count_price");
        });
        it("should compile sum metric", () => {
            const metrics = [
                { metric: "sum", field: "price" },
            ];
            const result = compileMetrics(metrics);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("sum_price");
        });
        it("should compile avg metric", () => {
            const metrics = [
                { metric: "avg", field: "price" },
            ];
            const result = compileMetrics(metrics);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("avg_price");
        });
        it("should compile min metric", () => {
            const metrics = [
                { metric: "min", field: "price" },
            ];
            const result = compileMetrics(metrics);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("min_price");
        });
        it("should compile max metric", () => {
            const metrics = [
                { metric: "max", field: "price" },
            ];
            const result = compileMetrics(metrics);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("max_price");
        });
        it("should compile multiple metrics", () => {
            const metrics = [
                { metric: "count", field: "price" },
                { metric: "avg", field: "price" },
                { metric: "max", field: "price" },
            ];
            const result = compileMetrics(metrics);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("count_price");
            expect(result).toHaveProperty("avg_price");
            expect(result).toHaveProperty("max_price");
        });
        it("should throw error for unsupported metric", () => {
            const metrics = [
                { metric: "invalid", field: "price" },
            ];
            expect(() => compileMetrics(metrics)).toThrow("Unsupported metric: invalid");
        });
        it("should throw error for unsupported metric field", () => {
            const metrics = [
                { metric: "count", field: "invalidField" },
            ];
            expect(() => compileMetrics(metrics)).toThrow("Unsupported metric field: invalidField");
        });
    });
    describe("compileComputations", () => {
        it("should compile avgPricePerM2 computation", () => {
            const computations = [{ name: "avgPricePerM2" }];
            const result = compileComputations(computations);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("avgPricePerM2");
        });
        it("should compile percentile computation", () => {
            const computations = [
                {
                    name: "percentile",
                    field: "price",
                    percentile: 50,
                },
            ];
            const result = compileComputations(computations);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("percentile_price_50");
        });
        it("should compile multiple percentile computations", () => {
            const computations = [
                {
                    name: "percentile",
                    field: "price",
                    percentile: 25,
                },
                {
                    name: "percentile",
                    field: "price",
                    percentile: 75,
                },
                {
                    name: "percentile",
                    field: "floorArea",
                    percentile: 50,
                },
            ];
            const result = compileComputations(computations);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("percentile_price_25");
            expect(result).toHaveProperty("percentile_price_75");
            expect(result).toHaveProperty("percentile_floorArea_50");
        });
        it("should compile mixed computations", () => {
            const computations = [
                { name: "avgPricePerM2" },
                {
                    name: "percentile",
                    field: "price",
                    percentile: 50,
                },
            ];
            const result = compileComputations(computations);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("avgPricePerM2");
            expect(result).toHaveProperty("percentile_price_50");
        });
        it("should return undefined for empty computations array", () => {
            const computations = [];
            const result = compileComputations(computations);
            expect(result).toBeUndefined();
        });
        it("should throw error for unsupported computation field in percentile", () => {
            const computations = [
                {
                    name: "percentile",
                    field: "invalidField",
                    percentile: 50,
                },
            ];
            expect(() => compileComputations(computations)).toThrow("Unsupported computation field: invalidField");
        });
        it("should handle edge case percentile values", () => {
            const computations = [
                {
                    name: "percentile",
                    field: "price",
                    percentile: 0,
                },
                {
                    name: "percentile",
                    field: "price",
                    percentile: 100,
                },
            ];
            const result = compileComputations(computations);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("percentile_price_0");
            expect(result).toHaveProperty("percentile_price_100");
        });
    });
});
