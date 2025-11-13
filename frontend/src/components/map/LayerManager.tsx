import { memo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

import type { MapFeatureCollection, FeatureLevel } from "@/types";
import { arrondissementLayerStyles, sectionLayerStyles } from "./config";
import { useStyleMap, useMapFeatureCollection } from "@/hooks/map";

const EMPTY_FEATURE_COLLECTION: MapFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export type LayerManagerProps = {
  level: FeatureLevel;
  hoveredFeatureId?: string | null;
  selectedArrondissementIds?: string[];
};

const LayerManager = memo(function ({
  level,
  hoveredFeatureId,
  selectedArrondissementIds,
}: LayerManagerProps) {
  const selectedIds = selectedArrondissementIds ?? [];
  const { data: communeFeatures } = useMapFeatureCollection({
    level: "commune",
  });
  const { data: sectionFeatures } = useMapFeatureCollection({
    level: "section",
  });

  const arrondissementsGeoData = (communeFeatures ??
    EMPTY_FEATURE_COLLECTION) as MapFeatureCollection;
  const sectionsGeoData = (sectionFeatures ??
    EMPTY_FEATURE_COLLECTION) as MapFeatureCollection;

  const {
    arrondissementFillColor,
    arrondissementFillOpacity,
    sectionFillColor,
    sectionFillOpacity,
  } = useStyleMap();

  return (
    <>
      {/* Arrondissements Layer */}
      <Source id="arrondissements" type="geojson" data={arrondissementsGeoData}>
        <Layer
          id="arrondissements-fill"
          type="fill"
          paint={{
            ...arrondissementLayerStyles.fill,
            "fill-color": arrondissementFillColor,
            "fill-opacity": arrondissementFillOpacity,
          }}
          filter={
            selectedIds.length > 0 && level === "section"
              ? ["!", ["in", ["get", "id"], ["literal", selectedIds]]]
              : ["!=", ["get", "id"], ""]
          }
        />
        <Layer
          id="arrondissements-stroke"
          type="line"
          paint={arrondissementLayerStyles.stroke}
        />
        <Layer
          id="arrondissements-stroke-hover"
          type="line"
          paint={{
            "line-color": "#60a5fa",
            "line-width": 3,
            "line-opacity": 1,
          }}
          filter={
            hoveredFeatureId
              ? ["==", ["get", "id"], hoveredFeatureId]
              : ["==", ["get", "id"], ""]
          }
        />
        <Layer
          id="arrondissements-stroke-selected"
          type="line"
          paint={{
            "line-color": "#2563eb",
            "line-width": 4,
            "line-opacity": 1,
          }}
          filter={
            selectedIds.length > 0
              ? ["in", ["get", "id"], ["literal", selectedIds]]
              : ["==", ["get", "id"], ""]
          }
        />
      </Source>

      {/* Sections Layer */}
      <Source id="sections" type="geojson" data={sectionsGeoData}>
        <Layer
          id="sections-fill"
          type="fill"
          paint={{
            ...sectionLayerStyles.fill,
            "fill-color": sectionFillColor,
            "fill-opacity": sectionFillOpacity,
          }}
          filter={
            selectedIds.length > 0 && level === "section"
              ? ["in", ["get", "inseeCode"], ["literal", selectedIds]]
              : ["==", ["get", "inseeCode"], ""]
          }
        />
        <Layer
          id="sections-stroke"
          type="line"
          paint={sectionLayerStyles.stroke}
          filter={
            selectedIds.length > 0 && level === "section"
              ? ["in", ["get", "inseeCode"], ["literal", selectedIds]]
              : ["==", ["get", "inseeCode"], ""]
          }
        />
        <Layer
          id="sections-stroke-hover"
          type="line"
          paint={{
            "line-color": "#3b82f6",
            "line-width": 3,
            "line-opacity": 1,
          }}
          filter={
            hoveredFeatureId && level === "section"
              ? ["==", ["get", "id"], hoveredFeatureId]
              : ["==", ["get", "id"], ""]
          }
        />
      </Source>
    </>
  );
});

export default LayerManager;
