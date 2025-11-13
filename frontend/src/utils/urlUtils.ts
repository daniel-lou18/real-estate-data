// Helper function to create URL-friendly slugs
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters except hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

export const inseeCodeFromCommuneParam = (
  urlParam: string | null | undefined
): string => {
  if (!urlParam) return "";
  return urlParam.split("-").at(-1) ?? "";
};

export const sectionFromSectionParam = (
  urlParam: string | null | undefined
): string => {
  if (!urlParam) return "";
  return urlParam.split("-").at(-1) ?? "";
};
