# Map Refactor Status

## Completed Work

- **Model the New API Responses**
  - Added type coverage for `MapFeatureCollection`, `MapFeatureProperties`, and legend responses inside the dedicated `mapService` (Zod validation still pending).
  - Introduced `mapService.getFeatures()` and `mapService.getLegend()` with all supported query parameters, including array serialization for `bbox`.

- **Refactor Data-Fetching Hooks**
  - Created `useMapFeatureCollection` and `useMapLegend` hooks that share a normalized filter state.
  - Added `MapFilterProvider` to centralize `level`, `field`, `propertyType`, `year`, etc., ensuring React Query keys stay in sync.

- **Rewire Map Rendering**
  - `LayerManager` now consumes live FeatureCollections from the API (static GeoJSON imports removed).
  - Fill/opacity expressions read `metricValue` directly from API features; hover/selection filters reference the new property names.
  - `FeaturePopup` renders metric information straight from feature properties instead of aggregate lookups.

- **Legend & Color Scale Overhaul**
  - Legend UI now renders API buckets/counts and reuses shared Tailwind/hex palettes.
  - Map color ramp derives from `legend.breaks`, removing `createDynamicMapColors` and decile lookup helpers.

- **Simplify Orchestration & Cleanup**
  - `useDataOrchestrator` no longer builds derived map lookup tables; it just switches between chat data and API map data.

## Pending / Next Steps

- **Model the New API Responses**
  - Optionally add Zod schemas for runtime validation once backend shapes stabilize.

- **Legend Improvements**
  - Update backend legend endpoint to accept `inseeCode` so commune selections can trigger arrondissement-specific buckets; wire the filter state once available.

- **Cleanup**
  - Delete legacy decile utilities (`useGetDeciles`, `createDynamicMapData`, etc.) after confirming no other modules import them.
  - Refresh documentation (`components/table/README.md`, map README) to reflect the new data flow.

- **UI Adjustments**
  - Audit filter controls (metric, property type, time, bounding box) and align them with supported backend parameters.
  - Extend dropdowns/tooltips to use humanized metric names from the backend, and ensure null values show “No data”.

- **Testing & Validation**
  - Add unit tests for the legend-to-MapLibre expression transforms and shared filter utilities.
  - Update integration/UI tests or Storybook stories with mocked FeatureCollection/legend responses.
  - Run manual QA across metrics, aggregation levels, temporal filters, and error states.
