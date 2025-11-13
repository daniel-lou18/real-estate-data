import type { MapFeature } from "@/types";

// MapLibre layer styles
export const arrondissementLayerStyles = {
  fill: {
    "fill-color": "#22c55e", // Tailwind green-500
    "fill-opacity": 0.5,
  },
  stroke: {
    "line-color": "#ffffff",
    "line-width": 1,
    "line-opacity": 1,
  },
  active: {
    fill: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.3,
    },
    stroke: {
      "line-color": "#1d4ed8",
      "line-width": 3,
      "line-opacity": 1,
    },
  },
  hover: {
    fill: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.3,
    },
    stroke: {
      "line-color": "#1d4ed8",
      "line-width": 3,
      "line-opacity": 1,
    },
  },
};

export const sectionLayerStyles = {
  fill: {
    "fill-color": "#ef4444",
    "fill-opacity": 0.5,
  },
  stroke: {
    "line-color": "#ffffff",
    "line-width": 1,
    "line-opacity": 0.6,
  },
  active: {
    fill: {
      "fill-color": "#ef4444",
      "fill-opacity": 0.2,
    },
    stroke: {
      "line-color": "#b91c1c",
      "line-width": 2,
      "line-opacity": 1,
    },
  },
  hover: {
    fill: {
      "fill-color": "#ef4444",
      "fill-opacity": 0.2,
    },
    stroke: {
      "line-color": "#b91c1c",
      "line-width": 2,
      "line-opacity": 1,
    },
  },
};

export const mapConfig = {
  arrondissement: {
    defaultStyle: arrondissementLayerStyles,
    activeStyle: arrondissementLayerStyles.active,
    hoverStyle: arrondissementLayerStyles.hover,
  },
  section: {
    defaultStyle: sectionLayerStyles,
    activeStyle: sectionLayerStyles.active,
    hoverStyle: sectionLayerStyles.hover,
  },
};

export type MapConfig = typeof mapConfig;

export const DEFAULT_MAP_VIEW_STATE = {
  latitude: 48.8566,
  longitude: 2.3522,
  zoom: 11,
};

export type PopupInfo = {
  longitude: number;
  latitude: number;
  feature: MapFeature;
};
