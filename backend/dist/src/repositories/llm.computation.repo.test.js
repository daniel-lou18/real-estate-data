import { describe, it, expect } from "vitest";
import { runComputationPlan } from "./llm.queries";
describe("llm.computation.repo", () => {
    describe("runComputationPlan", () => {
        it("should execute avgPricePerM2 computation", async () => {
            const args = {
                computations: [{ name: "avgPricePerM2" }],
                limit: 1,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            expect(Array.isArray(result.rows)).toBe(true);
            expect(result.count).toBeGreaterThanOrEqual(0);
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("avgPricePerM2");
            }
        });
        it("should execute percentile computation", async () => {
            const args = {
                computations: [{ name: "percentile", field: "price", percentile: 50 }],
                limit: 1,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            expect(Array.isArray(result.rows)).toBe(true);
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("percentile_price_50");
            }
        });
        it("should execute multiple computations", async () => {
            const args = {
                computations: [
                    { name: "avgPricePerM2" },
                    { name: "percentile", field: "price", percentile: 50 },
                ],
                limit: 1,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("avgPricePerM2");
                expect(result.rows[0]).toHaveProperty("percentile_price_50");
            }
        });
        it("should execute computation with groupBy", async () => {
            const args = {
                computations: [{ name: "avgPricePerM2" }],
                groupBy: ["year"],
                limit: 5,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("year");
                expect(result.rows[0]).toHaveProperty("avgPricePerM2");
            }
        });
        it("should execute computation with filters", async () => {
            const args = {
                computations: [{ name: "avgPricePerM2" }],
                filters: [{ field: "year", operator: "=", value: 2023 }],
                limit: 1,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
        });
        it("should execute computation with sort", async () => {
            const args = {
                computations: [{ name: "avgPricePerM2" }],
                groupBy: ["year"],
                sort: [{ field: "year", dir: "desc" }],
                limit: 3,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            // Check if results are sorted descending by year
            if (result.rows.length > 1) {
                const years = result.rows.map((r) => r.year);
                const sortedYears = [...years].sort((a, b) => b - a);
                expect(years).toEqual(sortedYears);
            }
        });
        it("should respect limit parameter", async () => {
            const args = {
                computations: [{ name: "avgPricePerM2" }],
                groupBy: ["year"],
                limit: 3,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows.length).toBeLessThanOrEqual(3);
        });
        it("should handle complex computation scenario", async () => {
            const args = {
                computations: [
                    { name: "avgPricePerM2" },
                    { name: "percentile", field: "price", percentile: 25 },
                    { name: "percentile", field: "price", percentile: 75 },
                ],
                groupBy: ["year"],
                filters: [{ field: "year", operator: ">=", value: 2020 }],
                sort: [{ field: "year", dir: "asc" }],
                limit: 10,
            };
            const result = await runComputationPlan(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            expect(result.rows.length).toBeLessThanOrEqual(10);
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("year");
                expect(result.rows[0]).toHaveProperty("avgPricePerM2");
                expect(result.rows[0]).toHaveProperty("percentile_price_25");
                expect(result.rows[0]).toHaveProperty("percentile_price_75");
            }
        });
    });
});
