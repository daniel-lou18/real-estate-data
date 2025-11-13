# MapLibre Components

This directory contains MapLibre/React Map GL components that mirror the functionality of the Leaflet components.

## Structure

- `Map.tsx` - Main map component using MapLibre
- `LayerManager.tsx` - Manages GeoJSON layers for arrondissements and sections
- `config.ts` - Configuration and styling for MapLibre layers
- `index.tsx` - Exports all components

## Hooks

- `useMapLibreZoom.ts` - Controls layer visibility based on zoom level
- `useMapLibreInteractions.ts` - Handles click and hover interactions

## Usage

```tsx
import { Map } from "@/components/mapLibre";

<Map setData={setData} arrs={arrs} sectionIds={sectionIds} />;
```

## Key Differences from Leaflet

1. **Layer Management**: Uses MapLibre's Source/Layer components instead of GeoJSON components
2. **Event Handling**: Uses map event listeners instead of component props
3. **Styling**: Uses MapLibre paint properties instead of Leaflet path options
4. **Zoom Control**: Uses layout visibility instead of adding/removing layers
