import { DvfPropertySales } from "../tables/dvfPropertySales";
import { PropertySales } from "../types";

// Helper function to parse string arrays and take the first value
const parseStringArray = (str: string): string => {
  try {
    // Handle split properties with pipe character by taking the first part
    if (str.includes("|")) {
      const firstPart = str.split("|")[0].trim();
      // Remove brackets and quotes from the first part
      return firstPart.replace(/[\[\]']/g, "");
    }

    // Handle single quotes by converting to double quotes for JSON.parse
    const normalizedStr = str.replace(/'/g, '"');
    const parsed = JSON.parse(normalizedStr);
    return Array.isArray(parsed) ? parsed[0] : str;
  } catch {
    return str; // fallback to original string
  }
};

// Helper function to handle price conversion with null for empty strings
const parsePrice = (value: number | string): number | null => {
  if (typeof value === "number") {
    return value;
  }

  // Handle empty string case - return null for missing data
  if (value === "") {
    return null;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

export const transformDvfToPropertySales = (
  mutations: DvfPropertySales[]
): PropertySales[] => {
  return mutations.map((mutation) => ({
    id: mutation._id,
    inseeCode: parseStringArray(mutation.l_codinsee),
    section: parseStringArray(mutation.l_section),
    year: mutation.anneemut,
    month: mutation.moismut,
    date: mutation.datemut,
    mutationType: mutation.libnatmut,
    propertyType: mutation.libtypbien,
    propertyTypeCode: mutation.codtypbien,
    price: parsePrice(mutation.valeurfonc),
    floorArea: mutation.sbati,
    numberOfStudioApartments: mutation.nbapt1pp,
    numberOf1BedroomApartments: mutation.nbapt2pp,
    numberOf2BedroomApartments: mutation.nbapt3pp,
    numberOf3BedroomApartments: mutation.nbapt4pp,
    numberOf4BedroomApartments: mutation.nbapt5pp,
    numberOfWorkspaces: mutation.nblocact,
    numberOfAppartments: mutation.nblocapt,
    numberOfSecondaryUnits: mutation.nblocdep,
    numberOfHouses: mutation.nblocmai,
    numberOfStudioHouses: mutation.nbmai1pp,
    numberOf1BedroomHouses: mutation.nbmai2pp,
    numberOf2BedroomHouses: mutation.nbmai3pp,
    numberOf3BedroomHouses: mutation.nbmai4pp,
    numberOf4BedroomHouses: mutation.nbmai5pp,
  }));
};
