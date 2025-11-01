import { describe, it, expect, beforeAll } from "vitest";
import { getLegend } from "./map.legend";
import { db } from "@/db";
import {
  apartments_by_insee_code_month,
  apartments_by_section_year,
  sectionsGeom,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const WORLD_BBOX: [number, number, number, number] = [-180, -90, 180, 90];
const BASE_PARAMS = {
  limit: 5000,
  offset: 0,
  bbox: WORLD_BBOX,
} as const;

type CommuneSample = {
  year: number;
  month: number;
};

type SectionSample = {
  year: number;
  inseeCode: string;
};

let communeSample: CommuneSample | null = null;
let sectionSample: SectionSample | null = null;

describe("getLegend", () => {
  beforeAll(async () => {
    const [communeRow] = await db
      .select({
        year: apartments_by_insee_code_month.year,
        month: apartments_by_insee_code_month.month,
      })
      .from(apartments_by_insee_code_month)
      .limit(1);

    if (communeRow && communeRow.year !== null && communeRow.month !== null) {
      communeSample = {
        year: communeRow.year,
        month: communeRow.month,
      };
    }

    const [sectionRow] = await db
      .select({
        year: apartments_by_section_year.year,
        section: apartments_by_section_year.section,
      })
      .from(apartments_by_section_year)
      .limit(1);

    if (sectionRow && sectionRow.year !== null && sectionRow.section !== null) {
      const [sectionInfo] = await db
        .select({ inseeCode: sectionsGeom.inseeCode })
        .from(sectionsGeom)
        .where(eq(sectionsGeom.section, sectionRow.section))
        .limit(1);

      if (sectionInfo && sectionInfo.inseeCode !== null) {
        sectionSample = {
          year: sectionRow.year,
          inseeCode: sectionInfo.inseeCode,
        };
      }
    }
  });

  it("returns a quantile legend for communes", async () => {
    const params = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: communeSample?.year ?? new Date().getFullYear(),
      bucketsCount: 5,
      ...(communeSample ? { month: communeSample.month } : {}),
    };

    const result = await getLegend(params);

    expect(result.field).toBe("avg_price_m2");
    expect(result.method).toBe("quantile");
    expect(Array.isArray(result.buckets)).toBe(true);
    expect(result.buckets.length).toBe(5);
    expect(Array.isArray(result.breaks)).toBe(true);
    expect(result.breaks.length).toBe(4); // N-1 breaks for N buckets

    // Check stats structure
    expect(result.stats).toBeDefined();
    expect(typeof result.stats.count).toBe("number");
    expect(result.stats.count).toBeGreaterThanOrEqual(0);

    // Check buckets structure
    result.buckets.forEach((bucket, index) => {
      expect(bucket).toHaveProperty("min");
      expect(bucket).toHaveProperty("max");
      expect(bucket).toHaveProperty("label");
      expect(bucket).toHaveProperty("count");
      expect(typeof bucket.label).toBe("string");
      expect(typeof bucket.count).toBe("number");
      expect(bucket.count).toBeGreaterThanOrEqual(0);
    });

    // Check that breaks are in ascending order
    for (let i = 1; i < result.breaks.length; i++) {
      expect(result.breaks[i]).toBeGreaterThanOrEqual(result.breaks[i - 1]);
    }

    // Check bucket boundaries match breaks
    result.buckets.forEach((bucket, index) => {
      if (index === 0) {
        // First bucket: min to first break
        expect(bucket.min).toBe(result.stats.min);
        expect(bucket.max).toBe(result.breaks[0]);
      } else if (index === result.buckets.length - 1) {
        // Last bucket: last break to max
        expect(bucket.min).toBe(result.breaks[result.breaks.length - 1]);
        expect(bucket.max).toBe(result.stats.max);
      } else {
        // Middle buckets
        expect(bucket.min).toBe(result.breaks[index - 1]);
        expect(bucket.max).toBe(result.breaks[index]);
      }
    });

    // Total count in buckets should match stats count
    const totalBucketCount = result.buckets.reduce(
      (sum, bucket) => sum + bucket.count,
      0
    );
    expect(totalBucketCount).toBe(result.stats.count);
  });

  it("returns a quantile legend for sections", async () => {
    const fallbackYear =
      sectionSample?.year ?? communeSample?.year ?? new Date().getFullYear();

    const params = {
      ...BASE_PARAMS,
      level: "section" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: fallbackYear,
      bucketsCount: 10,
      ...(sectionSample ? { inseeCode: sectionSample.inseeCode } : {}),
    };

    const result = await getLegend(params);

    expect(result.field).toBe("avg_price_m2");
    expect(result.method).toBe("quantile");
    expect(Array.isArray(result.buckets)).toBe(true);
    expect(result.buckets.length).toBe(10);
    expect(Array.isArray(result.breaks)).toBe(true);
    expect(result.breaks.length).toBe(9); // N-1 breaks for N buckets

    // Check stats structure
    expect(result.stats).toBeDefined();
    expect(typeof result.stats.count).toBe("number");

    // Check buckets structure
    result.buckets.forEach((bucket) => {
      expect(bucket).toHaveProperty("min");
      expect(bucket).toHaveProperty("max");
      expect(bucket).toHaveProperty("label");
      expect(bucket).toHaveProperty("count");
      expect(typeof bucket.label).toBe("string");
      expect(typeof bucket.count).toBe("number");
    });

    if (sectionSample) {
      const totalBucketCount = result.buckets.reduce(
        (sum, bucket) => sum + bucket.count,
        0
      );
      expect(totalBucketCount).toBe(result.stats.count);
    }
  });

  it("respects bbox parameter for communes", async () => {
    const params = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: communeSample?.year ?? new Date().getFullYear(),
      bucketsCount: 5,
      bbox: WORLD_BBOX,
      ...(communeSample ? { month: communeSample.month } : {}),
    };

    const result = await getLegend(params);

    expect(result.field).toBe("avg_price_m2");
    expect(result.method).toBe("quantile");
    expect(Array.isArray(result.buckets)).toBe(true);
    expect(result.stats.count).toBeGreaterThanOrEqual(0);
  });

  it("handles different metrics", async () => {
    const params = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "total_sales" as const,
      year: communeSample?.year ?? new Date().getFullYear(),
      bucketsCount: 5,
      ...(communeSample ? { month: communeSample.month } : {}),
    };

    const result = await getLegend(params);

    expect(result.field).toBe("total_sales");
    expect(result.method).toBe("quantile");
    expect(Array.isArray(result.buckets)).toBe(true);
    expect(result.buckets.length).toBe(5);

    // Check that stats match the metric type
    expect(result.stats).toBeDefined();
    if (result.stats.min !== null) {
      expect(typeof result.stats.min).toBe("number");
    }
    if (result.stats.max !== null) {
      expect(typeof result.stats.max).toBe("number");
    }
  });

  it("handles monthly vs yearly data correctly", async () => {
    if (!communeSample) {
      // Skip if no commune sample data available
      return;
    }

    const monthlyParams = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: communeSample.year,
      month: communeSample.month,
      bucketsCount: 5,
    };

    const yearlyParams = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: communeSample.year,
      bucketsCount: 5,
    };

    const monthlyResult = await getLegend(monthlyParams);
    const yearlyResult = await getLegend(yearlyParams);

    expect(monthlyResult.method).toBe("quantile");
    expect(yearlyResult.method).toBe("quantile");

    // Yearly data should have more or equal records than monthly
    expect(yearlyResult.stats.count).toBeGreaterThanOrEqual(
      monthlyResult.stats.count
    );
  });

  it("uses default bucketsCount of 10 when not specified", async () => {
    const params = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: communeSample?.year ?? new Date().getFullYear(),
      ...(communeSample ? { month: communeSample.month } : {}),
    };

    const result = await getLegend(params);

    expect(result.buckets.length).toBe(10);
    expect(result.breaks.length).toBe(9);
  });

  it("validates that median falls within min-max range", async () => {
    const params = {
      ...BASE_PARAMS,
      level: "commune" as const,
      propertyType: "apartment" as const,
      field: "avg_price_m2" as const,
      year: communeSample?.year ?? new Date().getFullYear(),
      bucketsCount: 5,
      ...(communeSample ? { month: communeSample.month } : {}),
    };

    const result = await getLegend(params);

    if (
      result.stats.min !== null &&
      result.stats.max !== null &&
      result.stats.median !== null
    ) {
      expect(result.stats.median).toBeGreaterThanOrEqual(result.stats.min);
      expect(result.stats.median).toBeLessThanOrEqual(result.stats.max);
    }
  });
});
