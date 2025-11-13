export const DIMENSION_FIELDS = [
  "inseeCode",
  "section",
  "year",
  "month",
  "iso_year",
  "iso_week",
] as const;

export const DIMENSION_CATEGORIES = ["spatial", "temporal"] as const;

export const FEATURE_YEARS = [
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
] as const;

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const ISO_WEEKS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
] as const;

export const FEATURE_YEAR_OPTIONS = FEATURE_YEARS.map((year) => ({
  value: year,
  label: year.toString(),
}));

export const FEATURE_LEVELS = ["commune", "section"] as const;

export const FEATURE_LEVEL_LABELS = {
  commune: "Commune",
  section: "Section",
};

export const FEATURE_LEVEL_OPTIONS = FEATURE_LEVELS.map((level) => ({
  value: level,
  label: FEATURE_LEVEL_LABELS[level],
}));

export const PROPERTY_TYPES = ["house", "apartment"] as const;

export const PROPERTY_TYPE_LABELS = {
  house: "House",
  apartment: "Apartment",
};

export const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPES.map((type) => ({
  value: type,
  label: PROPERTY_TYPE_LABELS[type],
}));
