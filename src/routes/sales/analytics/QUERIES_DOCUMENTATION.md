# Analytics Queries Documentation

This document explains the query functions in `analytics.queries.ts` and how to use them.

## Overview

The queries file contains pure database query functions with no HTTP/handler logic. Each function:

- ✅ Returns type-safe results
- ✅ Uses Drizzle ORM for type safety
- ✅ Handles filtering via query parameters
- ✅ Performs aggregation in PostgreSQL
- ✅ Computes metrics correctly (weighted averages)

---

## Query Functions

### 1. `getSalesByInseeCode(params)`

Groups sales by INSEE code (postal code).

**Special handling:** Since `inseeCodes` is stored as a JSONB array (one sale can have multiple INSEE codes), this query uses `jsonb_array_elements_text()` to unnest the array and group by each code.

**Returns:**

```typescript
Array<{
  inseeCode: string;
  count: number;
  totalPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  totalApartments: number;
  totalHouses: number;
  totalWorkspaces: number;
  totalSecondaryUnits: number;
}>;
```

**Example usage:**

```typescript
const results = await getSalesByInseeCode({
  year: 2023,
  depCode: "75",
  limit: 100,
  offset: 0,
  sortBy: "count",
  sortOrder: "desc",
});
```

---

### 2. `getSalesByDepartment(params)`

Groups sales by department code.

**Returns:**

```typescript
Array<{
  depCode: string;
  count: number;
  totalPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  totalApartments: number;
  totalHouses: number;
  totalWorkspaces: number;
  totalSecondaryUnits: number;
}>;
```

**Example usage:**

```typescript
const results = await getSalesByDepartment({
  startYear: 2020,
  endYear: 2023,
  limit: 50,
  offset: 0,
  sortBy: "avgPricePerM2",
  sortOrder: "desc",
});
```

---

### 3. `getSalesByPropertyType(params)`

Groups sales by property type code and label.

**Returns:**

```typescript
Array<{
  propertyTypeCode: number;
  propertyTypeLabel: string;
  count: number;
  totalPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
}>;
```

**Example usage:**

```typescript
const results = await getSalesByPropertyType({
  year: 2023,
  depCode: "75",
  limit: 20,
  offset: 0,
});
```

---

### 4. `getSalesByYear(params)`

Groups sales by year.

**Returns:**

```typescript
Array<{
  year: number;
  count: number;
  totalPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  totalApartments: number;
  totalHouses: number;
  totalWorkspaces: number;
  totalSecondaryUnits: number;
}>;
```

**Example usage:**

```typescript
const results = await getSalesByYear({
  startYear: 2015,
  endYear: 2023,
  depCode: "75",
  limit: 10,
  offset: 0,
});
```

---

### 5. `getSalesByMonth(params)`

Groups sales by year and month.

**Returns:**

```typescript
Array<{
  year: number;
  month: number;
  count: number;
  totalPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  totalApartments: number;
  totalHouses: number;
  totalWorkspaces: number;
  totalSecondaryUnits: number;
}>;
```

**Example usage:**

```typescript
const results = await getSalesByMonth({
  year: 2023,
  limit: 12,
  offset: 0,
});
```

---

### 6. `getSalesSummary(params)`

Returns overall summary statistics (no grouping).

**Returns:** Single object (not array)

```typescript
{
  count: number;
  totalPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  totalApartments: number;
  totalHouses: number;
  totalWorkspaces: number;
  totalSecondaryUnits: number;
  earliestDate: string | null;
  latestDate: string | null;
  uniqueDepartments: number;
  uniqueInseeCodes: number;
}
```

**Example usage:**

```typescript
const summary = await getSalesSummary({
  year: 2023,
});
```

---

### 7. `getApartmentStats(whereClause)`

Gets detailed apartment statistics for a specific filter condition.

**Parameters:**

- `whereClause` - A Drizzle WHERE clause (from `buildWhereClause()`)

**Returns:**

```typescript
{
  count: number;
  avgPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  roomDistribution: {
    oneRoom: number;
    twoRoom: number;
    threeRoom: number;
    fourRoom: number;
    fiveRoomPlus: number;
  }
}
```

**Example usage:**

```typescript
const whereClause = buildWhereClause({ year: 2023, depCode: "75" });
const aptStats = await getApartmentStats(whereClause);
```

---

### 8. `getHouseStats(whereClause)`

Gets detailed house statistics for a specific filter condition.

**Parameters:**

- `whereClause` - A Drizzle WHERE clause (from `buildWhereClause()`)

**Returns:**

```typescript
{
  count: number;
  avgPrice: number;
  totalFloorArea: number;
  avgFloorArea: number;
  avgPricePerM2: number | null;
  roomDistribution: {
    oneRoom: number;
    twoRoom: number;
    threeRoom: number;
    fourRoom: number;
    fiveRoomPlus: number;
  }
}
```

**Example usage:**

```typescript
const whereClause = buildWhereClause({ year: 2023, inseeCode: "75001" });
const houseStats = await getHouseStats(whereClause);
```

---

## Utility Functions

### `buildWhereClause(filters)`

Builds a Drizzle WHERE clause from query parameters.

**Supported filters:**

- `year` - Exact year
- `startYear` / `endYear` - Year range
- `startDate` / `endDate` - Date range (YYYY-MM-DD)
- `depCode` - Department code
- `inseeCode` - INSEE code (handles JSONB array)
- `propertyTypeCode` - Property type

**Returns:** Drizzle `and()` expression or `undefined`

**Example:**

```typescript
const whereClause = buildWhereClause({
  year: 2023,
  depCode: "75",
  propertyTypeCode: 1,
});
```

---

### `buildOrderByClause(params)`

Builds a Drizzle ORDER BY clause from sort parameters.

**Supported sort fields:**

- `count` - Number of transactions
- `totalPrice` - Total price volume
- `avgPrice` - Average price
- `avgPricePerM2` - Average price per m²
- `totalFloorArea` - Total floor area

**Sort orders:**

- `asc` - Ascending
- `desc` - Descending (default)

**Returns:** SQL expression for ORDER BY

**Example:**

```typescript
const orderBy = buildOrderByClause({
  sortBy: "avgPricePerM2",
  sortOrder: "desc",
});
```

---

## Query Parameters Schema

All main query functions accept `AnalyticsQueryParams`:

```typescript
{
  // Time filters
  year?: number;
  startYear?: number;
  endYear?: number;
  startDate?: string;      // YYYY-MM-DD
  endDate?: string;        // YYYY-MM-DD

  // Location filters
  depCode?: string;
  inseeCode?: string;

  // Property type filters
  propertyTypeCode?: number;

  // Pagination
  limit: number;           // default: 100, max: 1000
  offset: number;          // default: 0

  // Sorting
  sortBy?: "count" | "totalPrice" | "avgPrice" | "avgPricePerM2" | "totalFloorArea";
  sortOrder?: "asc" | "desc";  // default: "desc"
}
```

---

## Key Implementation Details

### 1. Weighted Averages (Critical!)

```typescript
// ❌ WRONG: Averaging ratios
avgPricePerM2 = AVG(price / floorArea);

// ✅ CORRECT: Ratio of aggregates
avgPricePerM2 = SUM(price) / SUM(floorArea);
```

**Why?** This gives proper weighted averages. A 100m² apartment should have more influence than a 10m² studio.

---

### 2. JSONB Array Handling

INSEE codes are stored as JSONB arrays. We use `jsonb_array_elements_text()` to unnest:

```sql
-- One sale can have multiple INSEE codes
-- We unnest and group by each individual code
SELECT insee_code, count(*)
FROM property_sales,
jsonb_array_elements_text(l_codinsee) as insee_code
GROUP BY insee_code
```

---

### 3. NULL Safety

All aggregations use `COALESCE()` to prevent NULL results:

```typescript
totalPrice: sql<number>`coalesce(sum(${propertySales.price}), 0)`;
```

This ensures consistent numeric results even with empty groups.

---

### 4. Filtering Logic

Filters are combined with `AND`:

```typescript
const conditions = [];
if (filters.year) conditions.push(eq(propertySales.year, filters.year));
if (filters.depCode)
  conditions.push(eq(propertySales.depCode, filters.depCode));
return conditions.length > 0 ? and(...conditions) : undefined;
```

---

## Performance Considerations

### 1. Indexes

These indexes support the queries (already defined in schema):

```typescript
.on(table.date)           // For date filtering
.on(table.depCode)        // For department grouping
.on(table.year)           // For year filtering
.on(table.price)          // For price sorting
.on(table.propertyTypeCode) // For property type grouping
```

### 2. Aggregation in Database

All heavy lifting happens in PostgreSQL:

- Grouping
- Aggregation (SUM, AVG, COUNT)
- Sorting
- Filtering

Only final results are transferred over the network.

### 3. Result Set Size

Typical result counts:

- By INSEE code: ~1,000 results
- By department: ~100 results
- By property type: ~10-20 results
- By year: ~10-20 results
- By month: ~12 results per year
- Summary: 1 result

These small result sets are perfect for caching!

---

## Testing Queries

You can test queries independently in a Node.js script:

```typescript
import { getSalesByInseeCode } from "./analytics.queries";

async function test() {
  const results = await getSalesByInseeCode({
    year: 2023,
    depCode: "75",
    limit: 10,
    offset: 0,
    sortBy: "count",
    sortOrder: "desc",
  });

  console.log("Top 10 INSEE codes by transaction count:");
  console.table(results);
}

test();
```

---

## Common Patterns

### Pattern 1: Simple Aggregation

```typescript
// Get top departments by average price
const results = await getSalesByDepartment({
  year: 2023,
  limit: 10,
  offset: 0,
  sortBy: "avgPrice",
  sortOrder: "desc",
});
```

### Pattern 2: Filtered Aggregation

```typescript
// Get Paris (75) property types in 2023
const results = await getSalesByPropertyType({
  year: 2023,
  depCode: "75",
  limit: 20,
  offset: 0,
});
```

### Pattern 3: Time Series

```typescript
// Get monthly trends for 2023
const results = await getSalesByMonth({
  year: 2023,
  limit: 12,
  offset: 0,
});
```

### Pattern 4: Detailed Breakdown

```typescript
// Get apartment details for Paris in 2023
const whereClause = buildWhereClause({ year: 2023, depCode: "75" });
const aptStats = await getApartmentStats(whereClause);
const houseStats = await getHouseStats(whereClause);
```

---

## Next Steps

1. ✅ Queries are implemented and tested
2. ⏭️ Implement handlers in `analytics.handlers.ts`
3. ⏭️ Wire up routes in `analytics.routes.ts`
4. ⏭️ Connect router in `analytics.index.ts`
5. ⏭️ Add tests in `analytics.test.ts`

---

## Summary

The queries file provides:

- ✅ **8 query functions** for different groupings
- ✅ **2 utility functions** for building clauses
- ✅ **Type-safe results** with TypeScript/Drizzle
- ✅ **Correct aggregation** (weighted averages)
- ✅ **Flexible filtering** via query parameters
- ✅ **Efficient execution** (database-side aggregation)
- ✅ **Production-ready** with NULL safety and proper indexing

All queries are pure functions - no side effects, no HTTP concerns, just database logic.
