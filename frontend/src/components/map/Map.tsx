import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import MapLibreMap from "react-map-gl/maplibre";
import LayerManager, { type LayerManagerProps } from "./LayerManager";
import FeaturePopup from "./FeaturePopup";
import LoadingOverlay from "./LoadingOverlay";
import ErrorOverlay from "./ErrorOverlay";
import MapLegend from "./MapLegend";
import { DEFAULT_MAP_VIEW_STATE, type PopupInfo } from "./config";
import { getCenterFromCoordinates } from "@/utils/mapUtils";
import { useMapNavigate, useFilters, useStyleMap } from "@/hooks/map";

type MapProps = Omit<LayerManagerProps, "level"> & {
  onMapClick?: () => void;
  setHoveredFeatureId: Dispatch<SetStateAction<string | null>>;
};

export default function Map({
  onMapClick,
  hoveredFeatureId,
  setHoveredFeatureId,
}: MapProps) {
  const { navigateToArrondissement, navigateToSection } = useMapNavigate();
  const [viewState, setViewState] = useState(DEFAULT_MAP_VIEW_STATE);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const { state: filterState, setInseeCodes } = useFilters();
  const { isLoading: isDataLoading, error: dataError } = useStyleMap();

  const onMouseMove = useCallback((event: any) => {
    const { features, lngLat } = event;
    if (features && features.length > 0) {
      const feature = features[0];
      setHoveredFeatureId(feature.properties.id);

      // Show popup on hover
      setPopupInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        feature: feature,
      });
    } else {
      // No features under cursor, clear hover state and hide popup
      setHoveredFeatureId(null);
      setPopupInfo(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredFeatureId(null);
    setPopupInfo(null);
  }, []);

  const onClick = useCallback(
    (event: any) => {
      const { features } = event;
      if (!features || features.length === 0) return;

      const feature = features[0];

      const isArrondissement = feature.properties && feature.properties.name;

      if (isArrondissement) {
        setInseeCodes([feature.properties.id]);
        navigateToArrondissement(feature);

        // Notify parent component that map was clicked
        onMapClick?.();
        // Calculate bounds for the feature and zoom in
        if (feature.geometry && feature.geometry.coordinates) {
          const coordinates = feature.geometry.coordinates[0];
          const { centerLat, centerLng } =
            getCenterFromCoordinates(coordinates);

          setViewState({
            latitude: centerLat,
            longitude: centerLng,
            zoom: 13, // Zoom level to show sections
          });
        }
      } else {
        navigateToSection(feature);
        // Notify parent component that map was clicked
        onMapClick?.();
      }
    },
    [navigateToArrondissement, navigateToSection, onMapClick, setInseeCodes]
  );

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {isDataLoading && <LoadingOverlay message="Loading price data..." />}
      {dataError && <ErrorOverlay message="Error loading data" />}

      <MapLegend selectedArrondissementIds={filterState.inseeCodes} />

      <MapLibreMap
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={[
          "arrondissements-fill",
          "arrondissements-stroke",
          "arrondissements-stroke-hover",
          "arrondissements-stroke-selected",
          "sections-fill",
          "sections-stroke",
          "sections-stroke-hover",
        ]}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <LayerManager
          hoveredFeatureId={hoveredFeatureId}
          selectedArrondissementIds={filterState.inseeCodes}
          level={filterState.level}
        />

        {popupInfo && (
          <FeaturePopup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            feature={popupInfo.feature}
            onClose={() => setPopupInfo(null)}
          />
        )}
      </MapLibreMap>
    </div>
  );
}
