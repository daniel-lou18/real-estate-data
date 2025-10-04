# property_sales table - Key Fields Reference

This document summarizes only the fields actively used across the app's analytics queries and raw endpoints. It is designed to be compact LLM context.

## Identifiers and Metadata

- `id` (int, pk): Unique mutation ID. Used by raw endpoints to fetch a single row.
- `createdAt` (timestamp): Ingestion timestamp. Not used in analytics; present on raw rows.

## Dates and Periods

- `date` (date): Transaction date. Used for range filters and summary min/max date.
- `year` (smallint): Extracted transaction year. Used for grouping and filtering.
- `month` (smallint): Extracted transaction month. Used for grouping (year, month).

## Location

- `depCode` (varchar): Department code. Used for filtering and summary unique count.
- `inseeCodes` (jsonb text[]): Original array of INSEE codes (not used directly in queries).
- `primaryInseeCode` (varchar, generated): First element of `inseeCodes`. Used for filtering, grouping by INSEE, and summary unique count.
- `sections` (jsonb text[]): Original array of section codes (not used directly in queries).
- `primarySection` (varchar, generated): First element of `sections`. Used for filtering and grouping by INSEE+section.

Notes:

- Generated columns remove the need for JSONB unnesting and enable indexing.

## Transaction Details

- `price` (numeric): Transaction price. Used in all aggregates (sum/avg/min/max) and price-per-m² calculations.
- `vefa` (boolean): Present but not used in current analytics.

## Property Composition (counts per transaction)

- `nblocmut` (smallint): Total properties involved. Aggregated as `totalProperties`.
- `nbApartments` (smallint): Count of apartments. Aggregated as `totalApartments`.
- `nbHouses` (smallint): Count of houses. Aggregated as `totalHouses`.
- `nbWorkspaces` (smallint): Count of work/commercial units. Aggregated as `totalWorkspaces`.
- `nbSecondaryUnits` (smallint): Count of secondary units/dependencies. Aggregated as `totalSecondaryUnits`.

## Room Distribution (per transaction)

Apartments:

- `nbapt1pp`, `nbapt2pp`, `nbapt3pp`, `nbapt4pp`, `nbapt5pp` (smallint): Aggregated as `apt{1..5}Room`.

Houses:

- `nbmai1pp`, `nbmai2pp`, `nbmai3pp`, `nbmai4pp`, `nbmai5pp` (smallint): Aggregated as `house{1..5}Room`.

## Surface Areas (m²)

- `floorArea` (numeric, `sbati`): Total built surface. Used for base totals/averages and overall price-per-m².
- `ApartmentFloorArea` (numeric, `sbatapt`): Used for apartment-specific metrics and apartment price-per-m² via FILTER.
- `HouseFloorArea` (numeric, `sbatmai`): Used for house-specific metrics and house price-per-m² via FILTER.
- `WorkspaceFloorArea` (numeric, `sbatact`): Present; not directly aggregated in current analytics.

Room-area by type (used only indirectly via totals in specific contexts):

- `sapt1pp`..`sapt5pp`, `smai1pp`..`smai5pp` (numeric): Stored; not directly exposed in current analytics responses.

## Property Type

- `propertyTypeCode` (smallint): Used for grouping by property type.
- `propertyTypeLabel` (varchar): Used in FILTER clauses to compute accurate apartment/house-only aggregates.

## Indexes of Interest

Defined in schema to support analytics queries:

- `idx_property_sales_datemut` on `date`
- `idx_property_sales_coddep` on `depCode`
- `idx_property_sales_anneemut` on `year`
- `idx_property_sales_codtypbien` on `propertyTypeCode`
- `idx_property_sales_valeurfonc` on `price`

Recommendation: also index generated columns (if not already added in a later migration):

- `primaryInseeCode`
- `primarySection`

## Usage Patterns

- Analytics groupings use: `primaryInseeCode`, `primarySection`, `year`, `month`, `propertyTypeCode`, `propertyTypeLabel`.
- Aggregates use: `price`, `floorArea`, `ApartmentFloorArea`, `HouseFloorArea`.
- Composition counts use: `nblocmut`, `nbApartments`, `nbHouses`, `nbWorkspaces`, `nbSecondaryUnits`.
- Room distributions use: apartment `nbapt{1..5}pp`, house `nbmai{1..5}pp`.
- Raw endpoints return full rows and use `id` for lookup.
