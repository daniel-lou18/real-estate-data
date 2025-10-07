# property_sales Table - SQL Query Reference

This document provides the database schema for generating SQL queries against the `property_sales` table. Column names are the actual PostgreSQL column names.

## Table Name

`property_sales`

## Key Columns for Queries

### Identifiers

- `idmutation` (integer, PRIMARY KEY): Unique transaction/mutation ID
- `idmutinvar` (varchar): Invariant mutation identifier
- `idopendata` (varchar): Open data identifier

### Dates and Time Periods

- `datemut` (date): Transaction date (format: YYYY-MM-DD). Use for date range filters and temporal analysis
- `anneemut` (smallint): Transaction year. Use for yearly grouping and filtering
- `moismut` (smallint): Transaction month (1-12). Use for monthly grouping and seasonal analysis

### Location Fields

- `coddep` (varchar): Department code (e.g., '75' for Paris). Use for filtering by department
- `l_codinsee` (jsonb): Array of INSEE codes (commune codes). Direct use requires JSONB operators
- `primary_insee_code` (varchar, GENERATED): First INSEE code from the array. **Prefer this for filtering and grouping by commune** (indexed)
- `l_section` (jsonb): Array of cadastral section codes. Direct use requires JSONB operators
- `primary_section` (varchar, GENERATED): First section code from the array. **Prefer this for filtering and grouping by cadastral section** (indexed)

**Note:** The `primary_insee_code` and `primary_section` columns are generated and indexed - always prefer these over the JSONB arrays for better performance.

### Transaction Details

- `valeurfonc` (numeric): Transaction price in euros. **Primary metric for price analysis, aggregations (SUM, AVG), and price-per-m² calculations**
- `libnatmut` (varchar): Nature of mutation/transaction description
- `vefa` (boolean): Sale under completion status (Vente en l'État Futur d'Achèvement)

### Property Composition (Counts)

These count the number of each property type involved in the transaction:

- `nblocmut` (smallint): **Total number of properties** in the transaction (sum of all property types)
- `nblocapt` (smallint): Number of apartments in the transaction
- `nblocmai` (smallint): Number of houses in the transaction
- `nblocact` (smallint): Number of commercial/workspace units in the transaction
- `nblocdep` (smallint): Number of secondary units/dependencies in the transaction

### Room Distribution

Apartments by room count (pp = "pièces principales" = main rooms):

- `nbapt1pp` (smallint): Number of 1-room apartments
- `nbapt2pp` (smallint): Number of 2-room apartments
- `nbapt3pp` (smallint): Number of 3-room apartments
- `nbapt4pp` (smallint): Number of 4-room apartments
- `nbapt5pp` (smallint): Number of 5+-room apartments

Houses by room count:

- `nbmai1pp` (smallint): Number of 1-room houses
- `nbmai2pp` (smallint): Number of 2-room houses
- `nbmai3pp` (smallint): Number of 3-room houses
- `nbmai4pp` (smallint): Number of 4-room houses
- `nbmai5pp` (smallint): Number of 5+-room houses

### Surface Areas (m²)

Total built surface areas:

- `sbati` (numeric): **Total built floor area** in m². Use for overall surface calculations and price-per-m²
- `sbatapt` (numeric): Total apartment floor area in m². Use for apartment-specific metrics
- `sbatmai` (numeric): Total house floor area in m². Use for house-specific metrics
- `sbatact` (numeric): Total commercial/workspace floor area in m²

Surface by room count for apartments:

- `sapt1pp` (numeric): Total m² of 1-room apartments
- `sapt2pp` (numeric): Total m² of 2-room apartments
- `sapt3pp` (numeric): Total m² of 3-room apartments
- `sapt4pp` (numeric): Total m² of 4-room apartments
- `sapt5pp` (numeric): Total m² of 5+-room apartments

Surface by room count for houses:

- `smai1pp` (numeric): Total m² of 1-room houses
- `smai2pp` (numeric): Total m² of 2-room houses
- `smai3pp` (numeric): Total m² of 3-room houses
- `smai4pp` (numeric): Total m² of 4-room houses
- `smai5pp` (numeric): Total m² of 5+-room houses

### Property Type Classification

- `codtypbien` (smallint): Property type code (numeric classification)
- `libtypbien` (varchar): Property type label/description (e.g., 'UN APPARTEMENT', 'UNE MAISON', 'BATI MIXTE - LOGEMENTS'). Use with ILIKE for flexible matching

**Available property type labels:**

- 'ACTIVITE'
- 'APPARTEMENT INDETERMINE'
- 'BATI - INDETERMINE : Vefa sans descriptif'
- 'BATI - INDETERMINE : Vente avec volume(s)'
- 'BATI MIXTE - LOGEMENT/ACTIVITE'
- 'BATI MIXTE - LOGEMENTS'
- 'DES DEPENDANCES'
- 'DES MAISONS'
- 'DEUX APPARTEMENTS'
- 'MAISON - INDETERMINEE'
- 'TERRAIN ARTIFICIALISE MIXTE'
- 'TERRAIN D\'AGREMENT'
- 'TERRAIN DE TYPE RESEAU'
- 'TERRAIN DE TYPE TAB'
- 'UN APPARTEMENT'
- 'UNE DEPENDANCE'
- 'UNE MAISON'

### Other Fields

- `sterr` (numeric): Land surface area in m²
- `nbdispo` (smallint): Number of provisions
- `nblot` (smallint): Number of lots
- `nbcomm` (smallint): Number of communes
- `created_at` (timestamp): Record insertion timestamp

## Indexes

The following columns are indexed for optimal query performance:

- `datemut` - Use for date filtering and sorting
- `coddep` - Use for department filtering
- `anneemut` - Use for year filtering
- `codtypbien` - Use for property type filtering
- `valeurfonc` - Use for price filtering and sorting

**Recommended for WHERE clauses:** `primary_insee_code` and `primary_section` (generated columns, should be indexed)

## Common Query Patterns

### Filtering

```sql
-- By location
WHERE coddep = '75'
WHERE primary_insee_code = '75101'

-- By date
WHERE datemut BETWEEN '2020-01-01' AND '2023-12-31'
WHERE anneemut = 2022

-- By property type
WHERE libtypbien ILIKE '%APPARTEMENT%'
WHERE codtypbien = 1

-- By price
WHERE valeurfonc > 100000 AND valeurfonc < 500000
```

### Aggregations

```sql
-- Total sales and average price by commune
SELECT primary_insee_code, COUNT(*) as nb_sales, AVG(valeurfonc) as avg_price
FROM property_sales
GROUP BY primary_insee_code

-- Price per m² by year
SELECT anneemut, SUM(valeurfonc) / NULLIF(SUM(sbati), 0) as price_per_m2
FROM property_sales
WHERE sbati > 0
GROUP BY anneemut

-- Monthly transaction volume
SELECT anneemut, moismut, COUNT(*) as nb_transactions, SUM(valeurfonc) as total_value
FROM property_sales
GROUP BY anneemut, moismut
ORDER BY anneemut, moismut
```

### Property Composition

```sql
-- Average number of apartments per transaction by department
SELECT coddep, AVG(nblocapt) as avg_apartments
FROM property_sales
WHERE nblocapt > 0
GROUP BY coddep

-- Distribution of apartment sizes (by room count)
SELECT
  SUM(nbapt1pp) as one_room,
  SUM(nbapt2pp) as two_room,
  SUM(nbapt3pp) as three_room,
  SUM(nbapt4pp) as four_room,
  SUM(nbapt5pp) as five_plus_room
FROM property_sales
WHERE anneemut = 2023
```

## Important Notes

1. **NULL handling:** Surface area fields may be NULL. Use `NULLIF()` or `COALESCE()` when dividing to avoid errors
2. **JSONB arrays:** Prefer generated columns (`primary_insee_code`, `primary_section`) over JSONB array fields for better performance
3. **Case sensitivity:** Use `ILIKE` instead of `LIKE` for case-insensitive string matching on `libtypbien`
4. **Price filtering:** Always consider adding reasonable price bounds (e.g., `valeurfonc > 0`) to filter out anomalies
5. **Date formats:** Use ISO format 'YYYY-MM-DD' for date literals
