import { describe, it, expect } from "vitest";
import { toQueryParams } from "./helpers";

describe("toQueryParams", () => {
  it("should return undefined for undefined input", () => {
    expect(toQueryParams(undefined)).toBeUndefined();
  });

  it("should return undefined for empty object", () => {
    expect(toQueryParams({})).toEqual({});
  });

  it("should handle string values", () => {
    const result = toQueryParams({ name: "test", city: "Paris" });
    expect(result).toEqual({ name: "test", city: "Paris" });
  });

  it("should handle number values", () => {
    const result = toQueryParams({ year: 2023, limit: 50 });
    expect(result).toEqual({ year: 2023, limit: 50 });
  });

  it("should handle boolean values", () => {
    const result = toQueryParams({ active: true, deleted: false });
    expect(result).toEqual({ active: true, deleted: false });
  });

  it("should convert string arrays to comma-separated strings", () => {
    const result = toQueryParams({ inseeCodes: ["75112", "75113", "75114"] });
    expect(result).toEqual({ inseeCodes: "75112,75113,75114" });
  });

  it("should convert number arrays to comma-separated strings", () => {
    const result = toQueryParams({ years: [2021, 2022, 2023] });
    expect(result).toEqual({ years: "2021,2022,2023" });
  });

  it("should convert mixed type arrays to comma-separated strings", () => {
    const result = toQueryParams({ values: ["abc", 123, true] });
    expect(result).toEqual({ values: "abc,123,true" });
  });

  it("should filter out non-primitive values from arrays and convert to comma-separated string", () => {
    const result = toQueryParams({
      codes: ["75112", { nested: "object" }, null, undefined, "75113"],
    });
    expect(result).toEqual({ codes: "75112,75113" });
  });

  it("should handle empty arrays", () => {
    const result = toQueryParams({ inseeCodes: [] });
    expect(result).toEqual({});
  });

  it("should ignore undefined values", () => {
    const result = toQueryParams({
      name: "test",
      year: undefined,
      city: "Paris",
    });
    expect(result).toEqual({ name: "test", city: "Paris" });
  });

  it("should ignore null values", () => {
    const result = toQueryParams({
      name: "test",
      year: null,
      city: "Paris",
    });
    expect(result).toEqual({ name: "test", city: "Paris" });
  });

  it("should handle complex objects with arrays and primitives", () => {
    const result = toQueryParams({
      inseeCodes: ["75112", "75113"],
      sections: ["75112000BZ", "75113000AY"],
      year: 2023,
      limit: 50,
      active: true,
    });
    expect(result).toEqual({
      inseeCodes: "75112,75113",
      sections: "75112000BZ,75113000AY",
      year: 2023,
      limit: 50,
      active: true,
    });
  });

  it("should handle arrays with single element", () => {
    const result = toQueryParams({ inseeCodes: ["75112"] });
    expect(result).toEqual({ inseeCodes: "75112" });
  });

  it("should ignore non-primitive, non-array values", () => {
    const result = toQueryParams({
      name: "test",
      obj: { nested: "value" },
      arr: [1, 2, 3],
    });
    expect(result).toEqual({
      name: "test",
      arr: "1,2,3",
    });
  });

  it("should preserve whitespace in string values and array elements", () => {
    const result = toQueryParams({
      single: "  test  ",
      array: ["  value1  ", "  value2  "],
    });
    expect(result).toEqual({
      single: "  test  ",
      array: "  value1  ,  value2  ",
    });
  });
});
