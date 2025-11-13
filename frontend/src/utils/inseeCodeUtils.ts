import { type TableData } from "@/types";

/**
 * Extracts INSEE codes/arrondissements from an array of data objects
 * Uses multiple strategies to identify and extract the codes
 */
export function extractInseeCodes(data: TableData[]): string[] {
  if (!data || data.length === 0) return [];

  const codes = new Set<string>();
  const sampleRow = data[0];

  // Strategy 1: Find columns by key name variations
  const inseeColumns = findInseeColumns(sampleRow);

  // Strategy 2: Find columns by value patterns
  const patternColumns = findInseePatternColumns(data);

  // Combine both strategies
  const allInseeColumns = [...new Set([...inseeColumns, ...patternColumns])];

  // Extract values from identified columns
  allInseeColumns.forEach((columnKey) => {
    data.forEach((row) => {
      const value = row[columnKey];
      if (isValidInseeCode(value)) {
        codes.add(String(value));
      }
    });
  });

  return Array.from(codes).sort();
}

/**
 * Finds columns that might contain INSEE codes based on key name variations
 */
function findInseeColumns(sampleRow: Record<string, any>): string[] {
  const inseeKeyPatterns = [
    // Direct INSEE code patterns
    /insee/i,
    /inseeCode/i,
    /insee_code/i,
    /codeInsee/i,
    /code_insee/i,

    // Arrondissement patterns
    /arrondissement/i,
    /arrond/i,
    /arr/i,

    // Postal code patterns (often related to INSEE)
    /postal/i,
    /postcode/i,
    /codePostal/i,
    /code_postal/i,
    /cp/i,

    // District/area patterns
    /district/i,
    /sector/i,
    /zone/i,
    /area/i,

    // French administrative terms
    /commune/i,
    /departement/i,
    /region/i,

    // Generic code patterns
    /code/i,
    /id/i,
    /identifier/i,
  ];

  const matchingColumns: string[] = [];

  Object.keys(sampleRow).forEach((key) => {
    const isInseeColumn = inseeKeyPatterns.some((pattern) => pattern.test(key));
    if (isInseeColumn) {
      matchingColumns.push(key);
    }
  });

  return matchingColumns;
}

/**
 * Finds columns that contain values matching INSEE code patterns
 */
function findInseePatternColumns(data: TableData[]): string[] {
  const patternColumns: string[] = [];
  const sampleRow = data[0];

  Object.keys(sampleRow).forEach((columnKey) => {
    let inseeCodeCount = 0;
    let totalChecked = 0;

    // Check first 10 rows for patterns
    const sampleSize = Math.min(10, data.length);

    for (let i = 0; i < sampleSize; i++) {
      const value = data[i][columnKey];
      if (value !== null && value !== undefined) {
        totalChecked++;
        if (isValidInseeCode(value)) {
          inseeCodeCount++;
        }
      }
    }

    // If more than 50% of values match INSEE pattern, consider it an INSEE column
    if (totalChecked > 0 && inseeCodeCount / totalChecked > 0.5) {
      patternColumns.push(columnKey);
    }
  });

  return patternColumns;
}

/**
 * Validates if a value is a valid INSEE code
 */
function isValidInseeCode(value: any): boolean {
  if (!value) return false;

  const stringValue = String(value).trim();

  // Must be exactly 5 characters
  if (stringValue.length !== 5) return false;

  // Must be all digits
  if (!/^\d{5}$/.test(stringValue)) return false;

  // Paris arrondissements start with 75
  if (stringValue.startsWith("75")) return true;

  // Other French departments (01-95, 971-976 for overseas)
  const department = parseInt(stringValue.substring(0, 2));
  if (department >= 1 && department <= 95) return true;
  if (department >= 971 && department <= 976) return true;

  return false;
}

/**
 * Gets INSEE code statistics from the extracted codes
 */
export function getInseeCodeStats(codes: string[]): {
  total: number;
  parisArrondissements: string[];
  otherDepartments: string[];
  departmentCounts: Record<string, number>;
} {
  const parisArrondissements = codes.filter((code) => code.startsWith("75"));
  const otherDepartments = codes.filter((code) => !code.startsWith("75"));

  const departmentCounts: Record<string, number> = {};
  codes.forEach((code) => {
    const dept = code.substring(0, 2);
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  return {
    total: codes.length,
    parisArrondissements,
    otherDepartments,
    departmentCounts,
  };
}

/**
 * Extracts parcel IDs from an array of data objects
 * Uses multiple strategies to identify and extract the parcel IDs
 */
export function extractParcelIds(data: TableData[]): string[] {
  if (!data || data.length === 0) return [];

  const parcelIds = new Set<string>();
  const sampleRow = data[0];

  // Strategy 1: Find columns by key name variations
  const parcelColumns = findParcelColumns(sampleRow);

  // Strategy 2: Find columns by value patterns
  const patternColumns = findParcelPatternColumns(data);

  // Combine both strategies
  const allParcelColumns = [...new Set([...parcelColumns, ...patternColumns])];

  // Extract values from identified columns
  allParcelColumns.forEach((columnKey) => {
    data.forEach((row) => {
      const value = row[columnKey];
      if (isValidParcelId(value)) {
        parcelIds.add(String(value));
      }
    });
  });

  return Array.from(parcelIds).sort();
}

/**
 * Finds columns that might contain parcel IDs based on key name variations
 */
function findParcelColumns(sampleRow: Record<string, any>): string[] {
  const parcelKeyPatterns = [
    // Direct parcel ID patterns
    /l_idpar/i,
    /idpar/i,
    /id_par/i,
    /parcel/i,
    /parcelle/i,
    /id_parcelle/i,
    /parcelId/i,
    /parcel_id/i,
    /parcelleId/i,
    /parcelle_id/i,

    // Land/plot patterns
    /plot/i,
    /land/i,
    /terrain/i,

    // Generic ID patterns that might be parcel-related
    /primaryParcelId/i,
    /primary_parcel_id/i,
    /primaryParcel/i,
    /primary_parcel/i,
  ];

  const matchingColumns: string[] = [];

  Object.keys(sampleRow).forEach((key) => {
    const isParcelColumn = parcelKeyPatterns.some((pattern) =>
      pattern.test(key)
    );
    if (isParcelColumn) {
      matchingColumns.push(key);
    }
  });

  return matchingColumns;
}

/**
 * Finds columns that contain values matching parcel ID patterns
 */
function findParcelPatternColumns(data: TableData[]): string[] {
  const patternColumns: string[] = [];
  const sampleRow = data[0];

  Object.keys(sampleRow).forEach((columnKey) => {
    let parcelIdCount = 0;
    let totalChecked = 0;

    // Check first 10 rows for patterns
    const sampleSize = Math.min(10, data.length);

    for (let i = 0; i < sampleSize; i++) {
      const value = data[i][columnKey];
      if (value !== null && value !== undefined) {
        totalChecked++;
        if (isValidParcelId(value)) {
          parcelIdCount++;
        }
      }
    }

    // If more than 50% of values match parcel ID pattern, consider it a parcel column
    if (totalChecked > 0 && parcelIdCount / totalChecked > 0.5) {
      patternColumns.push(columnKey);
    }
  });

  return patternColumns;
}

/**
 * Validates if a value is a valid parcel ID
 * Format: 75115000DF0141 (INSEE code + 000 + section + parcel number)
 */
function isValidParcelId(value: any): boolean {
  if (!value) return false;

  const stringValue = String(value).trim();

  // Must be exactly 14 characters
  if (stringValue.length !== 14) return false;

  // Must match pattern: 8 digits + 2 letters + 4 digits
  if (!/^\d{8}[A-Z]{2}\d{4}$/.test(stringValue)) return false;

  // First 5 characters should be a valid INSEE code
  const inseeCode = stringValue.substring(0, 5);
  if (!isValidInseeCode(inseeCode)) return false;

  return true;
}

/**
 * Parses a parcel ID into its components
 */
export function parseParcelId(parcelId: string): {
  inseeCode: string;
  section: string;
  parcelNumber: string;
  isValid: boolean;
} {
  if (!isValidParcelId(parcelId)) {
    return {
      inseeCode: "",
      section: "",
      parcelNumber: "",
      isValid: false,
    };
  }

  return {
    inseeCode: parcelId.substring(0, 5),
    section: parcelId.substring(8, 10),
    parcelNumber: parcelId.substring(10, 14),
    isValid: true,
  };
}

/**
 * Gets parcel ID statistics from the extracted parcel IDs
 */
export function getParcelIdStats(parcelIds: string[]): {
  total: number;
  inseeCodes: string[];
  sections: string[];
  inseeCodeCounts: Record<string, number>;
  sectionCounts: Record<string, number>;
} {
  const inseeCodes = parcelIds.map((id) => id.substring(0, 5));
  const sections = parcelIds.map((id) => id.substring(8, 10));

  const inseeCodeCounts: Record<string, number> = {};
  const sectionCounts: Record<string, number> = {};

  inseeCodes.forEach((code) => {
    inseeCodeCounts[code] = (inseeCodeCounts[code] || 0) + 1;
  });

  sections.forEach((section) => {
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  });

  return {
    total: parcelIds.length,
    inseeCodes: [...new Set(inseeCodes)].sort(),
    sections: [...new Set(sections)].sort(),
    inseeCodeCounts,
    sectionCounts,
  };
}

export function extractInseeCodesAndSectionIds(data: TableData[]): {
  inseeCodes: string[];
  sectionIds: string[];
} {
  const inseeCodes = extractInseeCodes(data);
  const sectionIds = extractSectionIds(data);
  return { inseeCodes, sectionIds };
}

/**
 * Extracts section IDs from parcel IDs by removing the last 4 digits
 * Section ID format: 75115000DF (INSEE code + 3 digits + 2 letters)
 */
export function getSectionIds(parcelIds: string[]): string[] {
  const sectionIds = new Set<string>();

  parcelIds.forEach((parcelId) => {
    if (isValidParcelId(parcelId)) {
      // Remove last 4 digits to get section ID
      const sectionId = parcelId.substring(0, 10);
      sectionIds.add(sectionId);
    }
  });

  return Array.from(sectionIds).sort();
}

/**
 * Extracts section IDs directly from data by parsing parcel IDs
 */
export function extractSectionIds(data: TableData[]): string[] {
  const parcelIds = extractParcelIds(data);
  return getSectionIds(parcelIds);
}

/**
 * Extracts section codes (AA, BD, DX, etc.) from dataset columns
 */
export function extractSectionCodes(data: TableData[]): string[] {
  if (!data || data.length === 0) return [];

  const sectionCodes = new Set<string>();
  const sampleRow = data[0];

  // Strategy 1: Find columns by key name variations
  const sectionColumns = findSectionColumns(sampleRow);

  // Strategy 2: Find columns by value patterns
  const patternColumns = findSectionPatternColumns(data);

  // Combine both strategies
  const allSectionColumns = [
    ...new Set([...sectionColumns, ...patternColumns]),
  ];

  // Extract values from identified columns
  allSectionColumns.forEach((columnKey) => {
    data.forEach((row) => {
      const value = row[columnKey];
      if (isValidSectionCode(value)) {
        sectionCodes.add(String(value).toUpperCase());
      }
    });
  });

  return Array.from(sectionCodes).sort();
}

/**
 * Finds columns that might contain section codes based on key name variations
 */
function findSectionColumns(sampleRow: Record<string, any>): string[] {
  const sectionKeyPatterns = [
    // Direct section patterns
    /section/i,
    /sections/i,
    /primarySection/i,
    /primary_section/i,
    /sectionCode/i,
    /section_code/i,
    /sectionId/i,
    /section_id/i,
    /sect/i,
  ];

  const matchingColumns: string[] = [];

  Object.keys(sampleRow).forEach((key) => {
    const isSectionColumn = sectionKeyPatterns.some((pattern) =>
      pattern.test(key)
    );
    if (isSectionColumn) {
      matchingColumns.push(key);
    }
  });

  return matchingColumns;
}

/**
 * Finds columns that contain values matching section code patterns
 */
function findSectionPatternColumns(data: TableData[]): string[] {
  const patternColumns: string[] = [];
  const sampleRow = data[0];

  Object.keys(sampleRow).forEach((columnKey) => {
    let sectionCodeCount = 0;
    let totalChecked = 0;

    // Check first 10 rows for patterns
    const sampleSize = Math.min(10, data.length);

    for (let i = 0; i < sampleSize; i++) {
      const value = data[i][columnKey];
      if (value !== null && value !== undefined) {
        totalChecked++;
        if (isValidSectionCode(value)) {
          sectionCodeCount++;
        }
      }
    }

    // If more than 50% of values match section code pattern, consider it a section column
    if (totalChecked > 0 && sectionCodeCount / totalChecked > 0.5) {
      patternColumns.push(columnKey);
    }
  });

  return patternColumns;
}

/**
 * Validates if a value is a valid section code (2 capital letters)
 */
function isValidSectionCode(value: any): boolean {
  if (!value) return false;

  const stringValue = String(value).trim();

  // Must be exactly 2 characters
  if (stringValue.length !== 2) return false;

  // Must be 2 capital letters
  if (!/^[A-Z]{2}$/.test(stringValue)) return false;

  return true;
}

/**
 * Creates section IDs by combining INSEE codes with section codes
 * Format: INSEE code + "000" + section code (e.g., "75115000AA")
 */
export function createSectionIdsFromCodes(
  inseeCodes: string[],
  sectionCodes: string[]
): string[] {
  const sectionIds = new Set<string>();

  inseeCodes.forEach((inseeCode) => {
    sectionCodes.forEach((sectionCode) => {
      const sectionId = inseeCode + "000" + sectionCode;
      sectionIds.add(sectionId);
    });
  });

  return Array.from(sectionIds).sort();
}

/**
 * Extracts both INSEE codes and section codes, then creates section IDs
 */
export function extractInseeCodesAndCreateSectionIds(data: TableData[]): {
  inseeCodes: string[];
  sectionIds: string[];
} {
  const inseeCodes = extractInseeCodes(data);
  const sectionCodes = extractSectionCodes(data);
  const sectionIds = createSectionIdsFromCodes(inseeCodes, sectionCodes);

  return {
    inseeCodes,
    sectionIds,
  };
}
