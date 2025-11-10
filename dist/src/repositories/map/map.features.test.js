import { describe, it, expect, beforeAll } from "vitest";
import { getMapFeatures } from "./map.features";
import { db } from "@/db";
import { apartments_by_insee_code_month, apartments_by_section_year, } from "@/db/schema";
const WORLD_BBOX = [-180, -90, 180, 90];
let communeSample = null;
let sectionSample = null;
describe("getMapFeatures", () => {
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
        })
            .from(apartments_by_section_year)
            .limit(1);
        if (sectionRow && sectionRow.year !== null) {
            sectionSample = {
                year: sectionRow.year,
            };
        }
    });
    it("returns a FeatureCollection for communes", async () => {
        const params = {
            level: "commune",
            propertyType: "apartment",
            field: "avg_price_m2",
            year: communeSample?.year ?? new Date().getFullYear(),
            bbox: WORLD_BBOX,
            limit: 5,
            offset: 0,
            ...(communeSample ? { month: communeSample.month } : {}),
        };
        const result = await getMapFeatures(params);
        expect(result.type).toBe("FeatureCollection");
        expect(Array.isArray(result.features)).toBe(true);
        expect(result.features.length).toBeLessThanOrEqual(5);
        if (result.features.length > 0) {
            const feature = result.features[0];
            expect(feature.type).toBe("Feature");
            expect(feature.geometry.type).toBe("MultiPolygon");
            expect(feature.properties.metricName).toBe("avg_price_m2");
            expect(Number.isFinite(feature.properties.metricValue)).toBe(true);
            expect(typeof feature.properties.id).toBe("string");
        }
        if (result.features.length > 0) {
            expect(result.bbox).toBeDefined();
            expect(result.bbox).toHaveLength(4);
            result.bbox.forEach((value) => {
                expect(typeof value).toBe("number");
                expect(Number.isFinite(value)).toBe(true);
            });
        }
    });
    it("returns a FeatureCollection for sections", async () => {
        const fallbackYear = sectionSample?.year ?? communeSample?.year ?? new Date().getFullYear();
        const params = {
            level: "section",
            propertyType: "apartment",
            field: "avg_price_m2",
            year: fallbackYear,
            bbox: WORLD_BBOX,
            limit: 5,
            offset: 0,
        };
        const result = await getMapFeatures(params);
        expect(result.type).toBe("FeatureCollection");
        expect(Array.isArray(result.features)).toBe(true);
        expect(result.features.length).toBeLessThanOrEqual(5);
        if (result.features.length > 0) {
            const feature = result.features[0];
            expect(feature.type).toBe("Feature");
            expect(feature.geometry.type).toBe("MultiPolygon");
            expect(feature.properties.metricName).toBe("avg_price_m2");
            expect(Number.isFinite(feature.properties.metricValue)).toBe(true);
            expect(typeof feature.properties.id).toBe("string");
            const props = feature.properties;
            expect(typeof props.inseeCode).toBe("string");
            expect(typeof props.section).toBe("string");
            expect(typeof props.prefix).toBe("string");
            expect(typeof props.code).toBe("string");
        }
        if (result.features.length > 0) {
            expect(result.bbox).toBeDefined();
            expect(result.bbox).toHaveLength(4);
            result.bbox.forEach((value) => {
                expect(typeof value).toBe("number");
                expect(Number.isFinite(value)).toBe(true);
            });
        }
    });
});
