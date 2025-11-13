import { describe, it, expect } from "vitest";
import { propertySales } from "@/db/schema/property_sales";
import { executeQuery } from "./llm.executor";
import { sql } from "drizzle-orm";
describe("llm.executor", () => {
    describe("executeQuery", () => {
        it("should execute a simple select query", async () => {
            const args = {
                select: {
                    id: propertySales.id,
                    price: propertySales.price,
                },
                limit: 5,
                offset: 0,
            };
            const result = await executeQuery(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            expect(Array.isArray(result.rows)).toBe(true);
            expect(result.count).toBeLessThanOrEqual(5);
        });
        it("should execute query with computed columns", async () => {
            const args = {
                select: {
                    avgPrice: sql `avg(${propertySales.price})`,
                },
                limit: 1,
                offset: 0,
            };
            const result = await executeQuery(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("avgPrice");
            }
        });
        it("should execute query with groupBy", async () => {
            const args = {
                select: {
                    year: propertySales.year,
                    count: sql `count(*)::int`,
                },
                groupBy: [propertySales.year],
                limit: 10,
                offset: 0,
            };
            const result = await executeQuery(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            if (result.rows.length > 0) {
                expect(result.rows[0]).toHaveProperty("year");
                expect(result.rows[0]).toHaveProperty("count");
            }
        });
        it("should execute query with where clause", async () => {
            const args = {
                select: {
                    id: propertySales.id,
                    year: propertySales.year,
                },
                where: sql `${propertySales.year} = 2023`,
                limit: 5,
                offset: 0,
            };
            const result = await executeQuery(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
        });
        it("should execute query with orderBy", async () => {
            const args = {
                select: {
                    id: propertySales.id,
                    price: propertySales.price,
                },
                orderBy: [sql `${propertySales.price} desc`],
                limit: 5,
                offset: 0,
            };
            const result = await executeQuery(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
        });
        it("should handle all optional parameters", async () => {
            const args = {
                select: {
                    year: propertySales.year,
                    avgPrice: sql `avg(${propertySales.price})`,
                },
                where: sql `${propertySales.year} >= 2020`,
                groupBy: [propertySales.year],
                orderBy: [sql `${propertySales.year} desc`],
                limit: 10,
                offset: 5,
            };
            const result = await executeQuery(args);
            expect(result).toBeDefined();
            expect(result.rows).toBeDefined();
            expect(result.rows.length).toBeLessThanOrEqual(10);
        });
    });
});
