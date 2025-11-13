import { describe, it, expect } from "vitest";
import { transformDvfToPropertySales } from "../dataTransformers";
import type { DvfPropertySales } from "../../tables/dvfPropertySales";

describe("transformDvfToPropertySales", () => {
  // Helper function to create a mock DVF record
  const createMockDvfRecord = (
    overrides: Partial<DvfPropertySales> = {}
  ): DvfPropertySales => ({
    _id: "test-id-123" as any,
    idmutation: 12345,
    l_codinsee: "['75120']",
    l_section: "['BW']",
    anneemut: 2023,
    datemut: "2023-06-15",
    libnatmut: "Vente",
    codtypbien: 1,
    libtypbien: "Appartement",
    moismut: 6,
    nbapt1pp: 0,
    nbapt2pp: 1,
    nbapt3pp: 0,
    nbapt4pp: 0,
    nbapt5pp: 0,
    nblocact: 0,
    nblocapt: 0,
    nblocdep: 1,
    nblocmai: 0,
    nbmai1pp: 0,
    nbmai2pp: 0,
    nbmai3pp: 0,
    nbmai4pp: 0,
    nbmai5pp: 0,
    sbati: 45.5,
    valeurfonc: 774000.0,
    ...overrides,
  });

  describe("Typical Values", () => {
    it("should transform typical property sale data correctly", () => {
      const mockData = createMockDvfRecord();
      const result = transformDvfToPropertySales([mockData]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "test-id-123",
        inseeCode: "75120",
        section: "BW",
        year: 2023,
        month: 6,
        date: "2023-06-15",
        mutationType: "Vente",
        propertyType: "Appartement",
        propertyTypeCode: 1,
        price: 774000.0,
        floorArea: 45.5,
        numberOfStudioApartments: 0,
        numberOf1BedroomApartments: 1,
        numberOf2BedroomApartments: 0,
        numberOf3BedroomApartments: 0,
        numberOf4BedroomApartments: 0,
        numberOfWorkspaces: 0,
        numberOfAppartments: 0,
        numberOfSecondaryUnits: 1,
        numberOfHouses: 0,
        numberOfStudioHouses: 0,
        numberOf1BedroomHouses: 0,
        numberOf2BedroomHouses: 0,
        numberOf3BedroomHouses: 0,
        numberOf4BedroomHouses: 0,
      });
    });
  });

  describe("String Array Parsing", () => {
    it("should parse single element arrays correctly", () => {
      const mockData = createMockDvfRecord({
        l_codinsee: "['75120']",
        l_section: "['BW']",
      });

      const result = transformDvfToPropertySales([mockData]);

      expect(result[0].inseeCode).toBe("75120");
      expect(result[0].section).toBe("BW");
    });

    it("should handle split properties by taking first value", () => {
      const mockData = createMockDvfRecord({
        l_codinsee: "['75117'| '75118']",
        l_section: "['AJ'| 'AS']",
      });

      const result = transformDvfToPropertySales([mockData]);

      expect(result[0].inseeCode).toBe("75117");
      expect(result[0].section).toBe("AJ");
    });

    it("should handle malformed JSON gracefully", () => {
      const mockData = createMockDvfRecord({
        l_codinsee: "['75120'", // Missing closing bracket
        l_section: "['BW'", // Missing closing bracket
      });

      const result = transformDvfToPropertySales([mockData]);

      expect(result[0].inseeCode).toBe("['75120'");
      expect(result[0].section).toBe("['BW'");
    });

    it("should handle non-array strings", () => {
      const mockData = createMockDvfRecord({
        l_codinsee: "75120",
        l_section: "BW",
      });

      const result = transformDvfToPropertySales([mockData]);

      expect(result[0].inseeCode).toBe("75120");
      expect(result[0].section).toBe("BW");
    });
  });

  describe("Price Handling", () => {
    it("should handle numeric prices correctly", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: 774000.0,
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBe(774000.0);
    });

    it("should handle string prices correctly", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: "774000.0",
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBe(774000.0);
    });

    it("should convert empty string to null", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: "",
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBeNull();
    });

    it("should convert invalid string to null", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: "abc",
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBeNull();
    });

    it("should handle zero prices", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: 0,
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBe(0);
    });

    it("should handle negative prices", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: -1000,
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBe(-1000);
    });
  });

  describe("Field Mapping", () => {
    it("should map all DVF fields to correct PropertySales fields", () => {
      const mockData = createMockDvfRecord({
        idmutation: 99999,
        anneemut: 2024,
        moismut: 12,
        datemut: "2024-12-01",
        libnatmut: "Vente",
        codtypbien: 2,
        libtypbien: "Maison",
        sbati: 120.0,
        valeurfonc: 500000,
        nbapt1pp: 1,
        nbapt2pp: 2,
        nbapt3pp: 3,
        nbapt4pp: 4,
        nbapt5pp: 5,
        nblocact: 10,
        nblocapt: 11,
        nblocdep: 12,
        nblocmai: 13,
        nbmai1pp: 14,
        nbmai2pp: 15,
        nbmai3pp: 16,
        nbmai4pp: 17,
        nbmai5pp: 18,
      });

      const result = transformDvfToPropertySales([mockData]);

      expect(result[0].id).toBe("test-id-123");
      expect(result[0].year).toBe(2024);
      expect(result[0].month).toBe(12);
      expect(result[0].date).toBe("2024-12-01");
      expect(result[0].mutationType).toBe("Vente");
      expect(result[0].propertyTypeCode).toBe(2);
      expect(result[0].propertyType).toBe("Maison");
      expect(result[0].floorArea).toBe(120.0);
      expect(result[0].price).toBe(500000);

      // Test apartment counts
      expect(result[0].numberOfStudioApartments).toBe(1);
      expect(result[0].numberOf1BedroomApartments).toBe(2);
      expect(result[0].numberOf2BedroomApartments).toBe(3);
      expect(result[0].numberOf3BedroomApartments).toBe(4);
      expect(result[0].numberOf4BedroomApartments).toBe(5);

      // Test house counts
      expect(result[0].numberOfStudioHouses).toBe(14);
      expect(result[0].numberOf1BedroomHouses).toBe(15);
      expect(result[0].numberOf2BedroomHouses).toBe(16);
      expect(result[0].numberOf3BedroomHouses).toBe(17);
      expect(result[0].numberOf4BedroomHouses).toBe(18);

      // Test other counts
      expect(result[0].numberOfWorkspaces).toBe(10);
      expect(result[0].numberOfAppartments).toBe(11);
      expect(result[0].numberOfSecondaryUnits).toBe(12);
      expect(result[0].numberOfHouses).toBe(13);
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple records", () => {
      const mockData1 = createMockDvfRecord({
        _id: "id1" as any,
        valeurfonc: 100000,
      });
      const mockData2 = createMockDvfRecord({
        _id: "id2" as any,
        valeurfonc: 200000,
      });

      const result = transformDvfToPropertySales([mockData1, mockData2]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("id1");
      expect(result[0].price).toBe(100000);
      expect(result[1].id).toBe("id2");
      expect(result[1].price).toBe(200000);
    });

    it("should handle empty array", () => {
      const result = transformDvfToPropertySales([]);
      expect(result).toHaveLength(0);
    });

    it("should handle very large numbers", () => {
      const mockData = createMockDvfRecord({
        valeurfonc: 999999999.99,
        sbati: 999999.99,
      });

      const result = transformDvfToPropertySales([mockData]);
      expect(result[0].price).toBe(999999999.99);
      expect(result[0].floorArea).toBe(999999.99);
    });
  });
});
