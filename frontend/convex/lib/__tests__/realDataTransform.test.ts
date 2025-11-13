import { describe, it, expect } from "vitest";
import { transformDvfToPropertySales } from "../dataTransformers";

describe("Real Data Transformation", () => {
  it("should transform real DVF data correctly", () => {
    const realData = {
      _id: "jd7c8df3nhyfen0w4jz6hss48s7r5e3x",
      anneemut: 2019,
      codtypbien: 121,
      datemut: "2019-11-18",
      idmutation: 12140664,
      l_codinsee: "['75116']",
      l_section: "['EE']",
      libnatmut: "Echange",
      libtypbien: "UN APPARTEMENT",
      moismut: 11,
      nbapt1pp: 0,
      nbapt2pp: 0,
      nbapt3pp: 0,
      nbapt4pp: 0,
      nbapt5pp: 1,
      nblocact: 0,
      nblocapt: 1,
      nblocdep: 3,
      nblocmai: 0,
      nbmai1pp: 0,
      nbmai2pp: 0,
      nbmai3pp: 0,
      nbmai4pp: 0,
      nbmai5pp: 0,
      sbati: 142,
      valeurfonc: 95000,
      _creationTime: 1758635690545.172,
    };

    const result = transformDvfToPropertySales([realData]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "jd7c8df3nhyfen0w4jz6hss48s7r5e3x",
      inseeCode: "75116",
      section: "EE",
      year: 2019,
      month: 11,
      date: "2019-11-18",
      mutationType: "Echange",
      propertyType: "UN APPARTEMENT",
      propertyTypeCode: 121,
      price: 95000,
      floorArea: 142,
      numberOfStudioApartments: 0,
      numberOf1BedroomApartments: 0,
      numberOf2BedroomApartments: 0,
      numberOf3BedroomApartments: 0,
      numberOf4BedroomApartments: 1, // nbapt5pp = 1 (4-bedroom apartment)
      numberOfWorkspaces: 0, // nblocact = 0
      numberOfAppartments: 1, // nblocapt = 1
      numberOfSecondaryUnits: 3, // nblocdep = 3
      numberOfHouses: 0, // nblocmai = 0
      numberOfStudioHouses: 0,
      numberOf1BedroomHouses: 0,
      numberOf2BedroomHouses: 0,
      numberOf3BedroomHouses: 0,
      numberOf4BedroomHouses: 0,
    });
  });
});
