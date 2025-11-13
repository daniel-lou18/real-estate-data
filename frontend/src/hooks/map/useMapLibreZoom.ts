import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";

export function useMapLibreZoom() {
  const { current: map } = useMap();
  const mapInstance = map?.getMap();
  const [zoomLevel, setZoomLevel] = useState<number>(
    mapInstance?.getZoom() || 11
  );

  // Track zoom level changes
  useEffect(() => {
    if (!mapInstance) return;

    const handleZoomEnd = () => {
      setZoomLevel(mapInstance.getZoom());
    };

    mapInstance.on("zoomend", handleZoomEnd);
    return () => {
      mapInstance.off("zoomend", handleZoomEnd);
    };
  }, [mapInstance]);

  return { zoomLevel };
}
