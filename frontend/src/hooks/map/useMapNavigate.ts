import type { CommuneFeature, SectionFeature } from "@/types";
import { createSlug } from "@/utils/urlUtils";
import { useLocation, useNavigate } from "react-router";

export function useMapNavigate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const commune = parts[0];

  const navigateToArrondissement = (feature: CommuneFeature) => {
    navigate(
      `/${createSlug(feature.properties.name)}-${feature.properties.id}`
    );
  };

  const navigateToSection = (feature: SectionFeature) => {
    navigate(`../${commune}/${feature.properties.section}`);
  };

  return { navigateToArrondissement, navigateToSection };
}
