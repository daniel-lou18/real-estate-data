## Real Estate Analytics Views and Facts Layer

This document describes the precomputed analytics layer used to power fast natural-language queries, tables (TanStack Table), and map visualizations.

It complements the base `property_sales` table described in `PROPERTY_SALES.md` and is implemented in:

- Code: `src/db/schema/mv_property_sales.ts`
- Code: `src/db/schema/mv_residential_sales_fact.ts`
- Code: `src/db/schema/communes_geom.ts`
- Code: `src/db/schema/sections_geom.ts`

### Goals

- Cover ~80% of common intents with pre-aggregated or filtered data.
- Provide stable, cacheable metrics for maps (including deciles for legend bins).
- Keep a non-aggregated but filtered "facts" MV for fast listings and drill-through.
- Enable fast map visualizations with PostGIS geometry data.

---

## Overview of Materialized Views

### Aggregates by geography and time

- Apartments

  - `apartments_by_insee_code_month` (INSEE × year × month)
  - `apartments_by_insee_code_year` (INSEE × year)
  - `apartments_by_insee_code_week` (INSEE × ISO year × ISO week)

- Houses
  - `houses_by_insee_code_month`
  - `houses_by_insee_code_year`
  - `houses_by_insee_code_week`

All aggregates compute the same metrics set (see Metrics section) and include a deciles array of price-per-m² for map legends.

### Non-aggregated residential facts (listings)

- `residential_sales_fact` (apartments + houses; sane bounds)

Designed for fast listing queries (day/week/month/INSEE/department/type), including derived fields: `res_type`, ISO week, area (type-specific), `price_per_m2`, and a simple `rooms_bucket`.

### Extremes (Top‑K) for quick “cheapest/most expensive”

- `residential_topk_by_insee_month` (INSEE × year × month × type)
- `residential_topk_by_insee_year` (INSEE × year × type)

Contain `rank_asc`/`rank_desc` by `price_per_m2` so clients can fetch top/bottom listings instantly.

### Geometry tables (PostGIS)

- `communes_geom` (Paris arrondissements)

  - `insee_code` (primary key), `name`, `geom` (MultiPolygon, 4326)
  - Contains 20 Paris arrondissements with boundaries

- `sections_geom` (Cadastral sections)
  - `section` (primary key), `insee_code`, `prefix`, `code`, `geom` (MultiPolygon, 4326)
  - Contains ~1389 cadastral sections with boundaries
  - Foreign key to `communes_geom.insee_code`

Both tables include GiST spatial indexes for fast geometric operations.

---

## Column keys per MV

- Aggregates (month): `inseeCode`, `year`, `month`
- Aggregates (year): `inseeCode`, `year`
- Aggregates (week): `inseeCode`, `iso_year`, `iso_week`
- Facts: `id`, `date`, `year`, `month`, `iso_year`, `iso_week`, `depCode`, `inseeCode`, `section`, `res_type`, `vefa`
- Top‑K: keys above plus `rank_asc`, `rank_desc`

---

## Metrics (aggregates)

All aggregates contain the following fields (when applicable, apartment/house specific):

- Count and totals

  - `total_sales`: count of transactions
  - `total_price`: sum of `valeurfonc`
  - `avg_price`: average `valeurfonc`
  - `total_area`: sum of area (type-specific column)
  - `avg_area`: average area (type-specific)
  - Composition counts: e.g., `total_apartments` or `total_houses`

- Price per m² (weighted)

  - `avg_price_m2` = `SUM(price) / NULLIF(SUM(area), 0)`
  - `min_price_m2`, `max_price_m2`

- Distribution statistics

  - `median_price`, `median_area`
  - Quartiles: `price_m2_p25`, `price_m2_p75`, `price_m2_iqr` (p75 − p25)
  - `price_m2_stddev` (stddev of price per m²)
  - `price_m2_deciles`: JSON array of p10, p20, …, p100 of `price/area`

- Min/Max price

  - `min_price`, `max_price`

- Room distribution (counts)
  - Apartments: `apartment_1_room`..`apartment_5_room`
  - Houses: `house_1_room`..`house_5_room`

All aggregates filter by residential type and apply outlier thresholds (see Bounds and filters below).

---

## Residential facts (non-aggregated)

MV: `residential_sales_fact`

- Keys and derived fields

  - `id`, `idOpenData`, `date`, `year`, `month`, `iso_year`, `iso_week`
  - `depCode`, `inseeCode`, `section`
  - `propertyTypeLabel`, `res_type` = 'apartment'|'house'
  - `vefa`
  - `price`, `area` (type-specific), `price_per_m2`, `rooms_bucket` ('1'..'5+' or null)

- Purpose
  - Fast listing queries for chat requests like “transactions last week in 75101”, “sales in May 2023 in dep 75”, etc.

---

## Top‑K extremes

MVs: `residential_topk_by_insee_month`, `residential_topk_by_insee_year`

- Rankings

  - `rank_asc`: dense_rank by `price_per_m2` ascending within (insee, time, res_type)
  - `rank_desc`: dense_rank descending

- Usage
  - Cheapest N: filter `rank_asc <= N` and order by `price_per_m2 ASC`
  - Most expensive N: filter `rank_desc <= N` and order by `price_per_m2 DESC`

---

## Bounds and filters (residential)

The aggregates and facts are restricted to residential categories with sensible thresholds from `@/repositories/constants`:

- Apartments: labels in ['UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE']

  - Area: `MIN_APARTMENT_AREA`..`MAX_APARTMENT_AREA`
  - Price: `MIN_APARTMENT_PRICE`..`MAX_APARTMENT_PRICE`

- Houses: labels in ['UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE']
  - Area: `MIN_HOUSE_AREA`..`MAX_HOUSE_AREA`
  - Price: `MIN_HOUSE_PRICE`..`MAX_HOUSE_PRICE`

These filters remove obvious outliers and ensure stable aggregates and legends.

---

## Index helpers

To speed up common filters, helper SQL statements are provided in code. Execute them via migrations or setup scripts.

- Facts (`mv_residential_sales_fact.ts`):

  - `idx_residential_sales_fact_date` on `(date)`
  - `idx_residential_sales_fact_year_month` on `(year, month)`
  - `idx_residential_sales_fact_iso` on `(iso_year, iso_week)`
  - `idx_residential_sales_fact_insee_date` on `(inseeCode, date)`
  - `idx_residential_sales_fact_dep_date` on `(depCode, date)`
  - `idx_residential_sales_fact_type_ym_insee` on `(res_type, year, month, inseeCode)`

- Top‑K (`mv_residential_sales_fact.ts`):

  - `idx_res_topk_month_keys` on `(inseeCode, year, month, res_type)`
  - `idx_res_topk_year_keys` on `(inseeCode, year, res_type)`
  - `idx_res_topk_month_price_m2` on `(price_per_m2)`
  - `idx_res_topk_year_price_m2` on `(price_per_m2)`

- Aggregates (`mv_property_sales.ts`):
  - Monthly: `idx_apts_insee_month`, `idx_houses_insee_month`
  - Yearly: `idx_apts_insee_year`, `idx_houses_insee_year`
  - Weekly: `idx_apts_insee_week`, `idx_houses_insee_week`

---

## Query examples

### 1) Table: monthly aggregates for apartments in a commune (INSEE)

```sql
select inseeCode, year, month, total_sales, avg_price_m2, price_m2_deciles
from apartments_by_insee_code_month
where inseeCode = '75101' and year = 2023
order by month;
```

### 2) Map: choropleth by INSEE using deciles for legend

Join with geometry table on `inseeCode`:

```sql
select
  mv.inseeCode,
  mv.avg_price_m2,
  mv.price_m2_deciles,
  c.name as commune_name,
  ST_AsGeoJSON(c.geom) as geometry
from apartments_by_insee_code_month mv
join communes_geom c on c.insee_code = mv.inseeCode
where mv.year = 2023 and mv.month = 5;
```

### 2b) Map: sections with geometry

```sql
select
  mv.inseeCode,
  mv.section,
  mv.avg_price_m2,
  s.geom
from apartments_by_insee_code_month mv
join sections_geom s on s.section = mv.section
where mv.year = 2023 and mv.month = 5;
```

### 3) Listings: transactions last week in a commune

```sql
select *
from residential_sales_fact
where inseeCode = '75101' and iso_year = 2024 and iso_week = 12
order by date desc;
```

### 4) Extremes: 10 cheapest apartments in 75101 in March 2023

```sql
select *
from residential_topk_by_insee_month
where inseeCode = '75101' and year = 2023 and month = 3 and res_type = 'apartment' and rank_asc <= 10
order by price_per_m2 asc;
```

### 5) Weekly trend: houses in 2024 for 75101

```sql
select iso_year, iso_week, total_sales, avg_price_m2
from houses_by_insee_code_week
where inseeCode = '75101' and iso_year = 2024
order by iso_week;
```

---

## Map integration guidance

- **Geometry tables**: Use `communes_geom` and `sections_geom` for map boundaries
- **Join pattern**: Combine analytics MVs with geometry tables at query time:
  ```sql
  SELECT mv.*, ST_AsGeoJSON(g.geom) as geometry
  FROM apartments_by_insee_code_month mv
  JOIN communes_geom g ON g.insee_code = mv.inseeCode
  ```
- **Output formats**:
  - GeoJSON: Use `ST_AsGeoJSON(geom)` for frontend consumption
  - Vector tiles: Use `ST_AsMVT()` for high-performance web maps
- **Legends**: Use `price_m2_deciles` for quantile-based color schemes
- **Performance**: GiST indexes on geometry columns enable fast spatial operations

---

## Notes and conventions

- Weighted price per m² is always computed as `SUM(price) / SUM(area)` at the group level (avoid averaging ratios).
- Areas are type-specific: apartments use `sbatapt`, houses use `sbatmai`.
- Residential filters and thresholds are applied to all aggregates and facts to ensure robust metrics.
- `res_type` is derived from `libtypbien` and limited to 'apartment' or 'house' in these MVs.

---

## Data import and setup

### Geometry data import

- Import GeoJSON files using `ogr2ogr`:
  ```bash
  ogr2ogr -f PostgreSQL "PG:host=localhost dbname=your_db user=your_user password=your_password" \
    src/db/cadastre-75-communes.json -nln communes_geom_staging -nlt MULTIPOLYGON \
    -lco GEOMETRY_NAME=geom -oo FLATTEN_NESTED_ATTRIBUTES=YES
  ```
- Map staging data to final schema:
  ```sql
  INSERT INTO communes_geom (insee_code, name, geom)
  SELECT id, nom, geom FROM communes_geom_staging
  ON CONFLICT (insee_code) DO UPDATE SET name = EXCLUDED.name, geom = EXCLUDED.geom;
  ```

### PostGIS requirements

- Ensure PostGIS extension is enabled: `CREATE EXTENSION postgis;`
- Geometry columns use SRID 4326 (WGS84)
- GiST indexes are automatically created for spatial operations

## Refresh strategy (optional)

- These are materialized views; you can schedule `REFRESH MATERIALIZED VIEW CONCURRENTLY` per MV when data updates.
- Immutable time slices (year/month/week) pair well with HTTP caching (ETag, long TTL) in API layers.
- Geometry tables are static and don't require regular refresh.
