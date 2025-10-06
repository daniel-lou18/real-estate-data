import { describe, it, expect } from "vitest";
import { propertySales } from "@/db/schema/property_sales";
import { buildAggregationArgs, buildQueryArgs } from "./queryBuilder";
import { DEFAULT_METRICS } from "./mappers";

describe("queryBuilder", () => {
  describe("buildQueryArgs", () => {
    it("applies DEFAULT_SELECT when no select provided", () => {
      const args: any = {};
      const built = buildQueryArgs(args);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("primaryInseeCode");
      expect(built.select).toHaveProperty("primarySection");
      expect(built.select).toHaveProperty("price");
      expect(built.select).toHaveProperty("nbProperties");
      expect(built.select).toHaveProperty("nbHouses");
      expect(built.select).toHaveProperty("nbApartments");
      expect(built.select).toHaveProperty("floorArea");
      expect(built.select).toHaveProperty("ApartmentFloorArea");
      expect(built.select).toHaveProperty("HouseFloorArea");
      expect(built.select).toHaveProperty("propertyTypeCode");
      expect(built.select).toHaveProperty("propertyTypeLabel");
    });
    it("builds defaults with DEFAULT_SELECT", () => {
      const args: any = { limit: undefined, offset: undefined };
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("price");
    });

    it("honors user select, filters and sort", () => {
      const args: any = {
        select: ["price"],
        filters: [{ field: "year", operator: "=", value: 2023 }],
        sort: [{ field: "price", dir: "desc" }],
        limit: 10,
        offset: 5,
      };
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(10);
      expect(built.offset).toBe(5);
      expect(built.select).toHaveProperty("price");
      expect(built.where).toBeDefined();
      expect(built.orderBy).toBeDefined();
    });

    it("handles undefined select", () => {
      const args: any = { select: undefined };
      const built = buildQueryArgs(args);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("price");
      expect(built.where).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
    });

    it("handles null select", () => {
      const args: any = { select: null };
      const built = buildQueryArgs(args);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("price");
    });

    it("handles empty select array", () => {
      const args: any = { select: [] };
      const built = buildQueryArgs(args);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("price");
    });

    it("handles undefined filters", () => {
      const args: any = { filters: undefined };
      const built = buildQueryArgs(args);
      expect(built.where).toBeUndefined();
    });

    it("handles null filters", () => {
      const args: any = { filters: null };
      const built = buildQueryArgs(args);
      expect(built.where).toBeUndefined();
    });

    it("handles empty filters array", () => {
      const args: any = { filters: [] };
      const built = buildQueryArgs(args);
      expect(built.where).toBeUndefined();
    });

    it("handles undefined sort", () => {
      const args: any = { sort: undefined };
      const built = buildQueryArgs(args);
      expect(built.orderBy).toBeUndefined();
    });

    it("handles null sort", () => {
      const args: any = { sort: null };
      const built = buildQueryArgs(args);
      expect(built.orderBy).toBeUndefined();
    });

    it("handles empty sort array", () => {
      const args: any = { sort: [] };
      const built = buildQueryArgs(args);
      expect(built.orderBy).toBeUndefined();
    });

    it("handles undefined limit and offset", () => {
      const args: any = { limit: undefined, offset: undefined };
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles null limit and offset", () => {
      const args: any = { limit: null, offset: null };
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles completely empty args object", () => {
      const args: any = {};
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("price");
      expect(built.where).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
    });

    it("handles mixed null/undefined properties", () => {
      const args: any = {
        select: null,
        filters: undefined,
        sort: [],
        limit: null,
        offset: undefined,
      };
      const built = buildQueryArgs(args);
      expect(built.select).toHaveProperty("id");
      expect(built.select).toHaveProperty("date");
      expect(built.select).toHaveProperty("price");
      expect(built.where).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles negative limit and offset", () => {
      const args: any = { limit: -5, offset: -10 };
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(50); // Should be capped to minimum 1, then default 50
      expect(built.offset).toBe(0); // Should be capped to minimum 0
    });

    it("handles very large limit and offset", () => {
      const args: any = { limit: 9999, offset: 5000 };
      const built = buildQueryArgs(args);
      expect(built.limit).toBe(500); // Should be capped to maximum 500
      expect(built.offset).toBe(5000);
    });
  });

  describe("buildAggregationArgs", () => {
    it("applies DEFAULT_METRICS when no metrics provided", () => {
      const args: any = {};
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("avg_ApartmentFloorArea");
      expect(built.select).toHaveProperty("avg_HouseFloorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
      expect(built.select).toHaveProperty("sum_nbHouses");
      expect(built.select).toHaveProperty("sum_nbApartments");
    });
    it("builds metric + group select and defaults", () => {
      const args: any = {
        metrics: [{ metric: "count", field: "price" }],
        groupBy: ["year"],
      };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
      expect(built.select).toHaveProperty("count_price");
      expect(built.select).toHaveProperty("year");
      expect(built.groupBy).toBeDefined();
    });

    it("includes filters and sort", () => {
      const args: any = {
        metrics: [{ metric: "avg", field: "price" }],
        groupBy: ["year"],
        filters: [{ field: "year", operator: ">=", value: 2020 }],
        sort: [{ field: "year", dir: "asc" }],
        limit: 25,
      };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(25);
      expect(built.where).toBeDefined();
      expect(built.orderBy).toBeDefined();
    });

    it("handles multiple groupBy fields with custom limit", () => {
      const args: any = {
        groupBy: ["year", "primaryInseeCode"],
        limit: 200,
      };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(200);
      expect(built.offset).toBe(0);
      expect(built.select).toHaveProperty("year");
      expect(built.select).toHaveProperty("primaryInseeCode");
      expect(built.groupBy).toBeDefined();
    });

    it("handles undefined groupBy", () => {
      const args: any = { groupBy: undefined };
      const built = buildAggregationArgs(args);
      expect(built.select).toEqual(DEFAULT_METRICS);
      expect(built.groupBy).toBeUndefined();
    });

    it("handles null groupBy", () => {
      const args: any = { groupBy: null };
      const built = buildAggregationArgs(args);
      expect(built.select).toEqual(DEFAULT_METRICS);
      expect(built.groupBy).toBeUndefined();
    });

    it("handles empty groupBy array", () => {
      const args: any = { groupBy: [] };
      const built = buildAggregationArgs(args);
      expect(built.select).toEqual(DEFAULT_METRICS);
      expect(built.groupBy).toBeUndefined();
    });

    it("handles undefined metrics", () => {
      const args: any = { metrics: undefined };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
    });

    it("handles null metrics", () => {
      const args: any = { metrics: null };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
    });

    it("handles empty metrics array", () => {
      const args: any = { metrics: [] };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
    });

    it("handles undefined filters", () => {
      const args: any = { filters: undefined };
      const built = buildAggregationArgs(args);
      expect(built.where).toBeUndefined();
    });

    it("handles null filters", () => {
      const args: any = { filters: null };
      const built = buildAggregationArgs(args);
      expect(built.where).toBeUndefined();
    });

    it("handles empty filters array", () => {
      const args: any = { filters: [] };
      const built = buildAggregationArgs(args);
      expect(built.where).toBeUndefined();
    });

    it("handles undefined sort", () => {
      const args: any = { sort: undefined };
      const built = buildAggregationArgs(args);
      expect(built.orderBy).toBeUndefined();
    });

    it("handles null sort", () => {
      const args: any = { sort: null };
      const built = buildAggregationArgs(args);
      expect(built.orderBy).toBeUndefined();
    });

    it("handles empty sort array", () => {
      const args: any = { sort: [] };
      const built = buildAggregationArgs(args);
      expect(built.orderBy).toBeUndefined();
    });

    it("handles undefined limit", () => {
      const args: any = { limit: undefined };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles null limit", () => {
      const args: any = { limit: null };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles completely empty args object", () => {
      const args: any = {};
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
      expect(built.where).toBeUndefined();
      expect(built.groupBy).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
    });

    it("handles groupBy without metrics", () => {
      const args: any = { groupBy: ["year"] };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("year");
      expect(built.groupBy).toBeDefined();
      expect(built.limit).toBe(50);
    });

    it("handles metrics without groupBy", () => {
      const args: any = { metrics: [{ metric: "count", field: "price" }] };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("count_price");
      expect(built.groupBy).toBeUndefined();
      expect(built.limit).toBe(50);
    });

    it("handles mixed null/undefined properties", () => {
      const args: any = {
        groupBy: null,
        metrics: undefined,
        filters: [],
        sort: null,
        limit: undefined,
      };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
      expect(built.where).toBeUndefined();
      expect(built.groupBy).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles negative limit", () => {
      const args: any = { limit: -10 };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(50); // Should be capped to minimum 1, then default 50
    });

    it("handles very large limit", () => {
      const args: any = { limit: 9999 };
      const built = buildAggregationArgs(args);
      expect(built.limit).toBe(500); // Should be capped to maximum 500
    });

    it("handles all properties as null", () => {
      const args: any = {
        groupBy: null,
        metrics: null,
        filters: null,
        sort: null,
        limit: null,
      };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
      expect(built.where).toBeUndefined();
      expect(built.groupBy).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("handles all properties as undefined", () => {
      const args: any = {
        groupBy: undefined,
        metrics: undefined,
        filters: undefined,
        sort: undefined,
        limit: undefined,
      };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
      expect(built.where).toBeUndefined();
      expect(built.groupBy).toBeUndefined();
      expect(built.orderBy).toBeUndefined();
      expect(built.limit).toBe(50);
      expect(built.offset).toBe(0);
    });

    it("includes groupBy columns and default metrics when no metrics provided", () => {
      const args: any = { groupBy: ["year"] };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("year");
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
    });

    it("includes groupBy and custom metrics when metrics provided", () => {
      const args: any = {
        groupBy: ["year"],
        metrics: [{ metric: "count", field: "price" }],
      };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("year");
      expect(built.select).toHaveProperty("count_price");
      expect(built.select).not.toHaveProperty("avg_price"); // Should not include defaults when custom metrics provided
    });

    it("includes groupBy and default metrics when metrics array is empty", () => {
      const args: any = { groupBy: ["year"], metrics: [] };
      const built = buildAggregationArgs(args);
      expect(built.select).toHaveProperty("year");
      expect(built.select).toHaveProperty("avg_price");
      expect(built.select).toHaveProperty("avg_floorArea");
      expect(built.select).toHaveProperty("sum_nbProperties");
    });
  });
});
