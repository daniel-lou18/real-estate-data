import { useParams } from "react-router";
import { useEffect } from "react";
import {
  inseeCodeFromCommuneParam,
  sectionFromSectionParam,
} from "@/utils/urlUtils";
import type { FeatureLevel } from "@/types";

export function useSyncUrlWithFilters(setLevel: (level: FeatureLevel) => void) {
  const { commune, section } = useParams();
  const inseeCode = inseeCodeFromCommuneParam(commune);
  const sectionCode = sectionFromSectionParam(section);

  useEffect(() => {
    if (sectionCode || inseeCode) {
      setLevel("section");
    } else {
      setLevel("commune");
    }
  }, [inseeCode, sectionCode, setLevel]);
}
