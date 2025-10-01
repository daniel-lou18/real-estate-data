# Analytics API - Approach & Design

This document explains the design philosophy, aggregation strategy, and implementation approach for the property sales analytics endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Aggregation Strategy](#aggregation-strategy)
4. [Schema Design](#schema-design)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Performance Considerations](#performance-considerations)

---

## Overview

### The Problem

We have a database with **500,000+ property sales records**. Users need both:

- **Raw data access** for detailed analysis (paid tier)
- **Aggregated insights** for market trends (free tier, cacheable)

### The Solution

A three-layer API architecture:

```
1. /sales              → Raw records (with computed fields)
2. /sales/analytics/*  → Aggregated data (grouped with statistics)
3. Helper functions    → Reusable computation logic
```

---

## Architecture

### URL Structure

```
# Raw Data (base resource)
GET /sales                    # List all sales (paginated)
GET /sales/{id}              # Get single sale

# Analytics (aggregated data)
GET /sales/analytics/by-insee-code      # Group by postal code
GET /sales/analytics/by-department      # Group by department
GET /sales/analytics/by-property-type   # Group by property type
GET /sales/analytics/by-year            # Group by year
GET /sales/analytics/by-month           # Group by month
GET /sales/analytics/summary            # Overall statistics
```

### Why This Structure?

- ✅ **Clear separation**: Raw vs. aggregated data
- ✅ **RESTful**: Resources represent meaningful entities
- ✅ **Scalable**: Easy to add new groupings
- ✅ **Cacheable**: Analytics endpoints return stable, small result sets
- ✅ **Flexible**: Query parameters allow filtering

---

## Aggregation Strategy

### The Mental Model

When grouping sales data, ask for each column:

> **"What happens when I have multiple sales?"**

| Column Type          | Aggregation Method                 | Example                           |
| -------------------- | ---------------------------------- | --------------------------------- |
| **Grouping Key**     | `GROUP BY`                         | `inseeCode`, `depCode`, `year`    |
| **Counts**           | `SUM()`                            | `nbHouses`, `nbApartments`        |
| **Monetary Values**  | `SUM()`, `AVG()`, `MIN()`, `MAX()` | `price`                           |
| **Areas**            | `SUM()`, `AVG()`                   | `floorArea`, `ApartmentFloorArea` |
| **Computed Metrics** | Calculate AFTER aggregation        | `avgPricePerM2`                   |
| **Metadata**         | Don't include                      | `id`, `createdAt`                 |
| **Labels**           | Any value (from first record)      | `propertyTypeLabel`               |

### Example: Grouping by INSEE Code

#### Before Aggregation (raw data)

```
Sale 1: inseeCode=75001, price=500000, floorArea=45, nbApartments=1
Sale 2: inseeCode=75001, price=600000, floorArea=55, nbApartments=1
Sale 3: inseeCode=75002, price=450000, floorArea=40, nbApartments=1
```

#### After Aggregation (what API returns)

```json
[
  {
    "inseeCode": "75001",
    "count": 2,
    "totalPrice": 1100000,
    "avgPrice": 550000,
    "minPrice": 500000,
    "maxPrice": 600000,
    "totalFloorArea": 100,
    "avgFloorArea": 50,
    "avgPricePerM2": 11000,
    "propertyTypes": {
      "totalApartments": 2,
      "totalHouses": 0
    }
  },
  {
    "inseeCode": "75002",
    "count": 1,
    "totalPrice": 450000,
    "avgPrice": 450000,
    "totalFloorArea": 40,
    "avgPricePerM2": 11250,
    "propertyTypes": {
      "totalApartments": 1,
      "totalHouses": 0
    }
  }
]
```

### Aggregation Rules

#### ✅ SUM These (Additive Quantities)

```typescript
// Counts - these add up across transactions
totalHouses: SUM(nbHouses);
totalApartments: SUM(nbApartments);
total1RoomApts: SUM(nbapt1pp);
total2RoomApts: SUM(nbapt2pp);

// Areas - total surface area sold
totalFloorArea: SUM(floorArea);
totalApartmentArea: SUM(ApartmentFloorArea);
totalHouseArea: SUM(HouseFloorArea);

// Money - total transaction volume
totalPrice: SUM(price);
```

#### 📊 AVG These (Typical Values)

```typescript
avgPrice: AVG(price);
avgFloorArea: AVG(floorArea);
```

#### 📈 MIN/MAX These (Ranges)

```typescript
minPrice: MIN(price);
maxPrice: MAX(price);
minFloorArea: MIN(floorArea);
maxFloorArea: MAX(floorArea);
```

#### 🧮 Compute AFTER Aggregation (Critical!)

```typescript
// ❌ WRONG: AVG(price / floorArea)
// This treats all sales equally, even if sizes differ drastically

// ✅ CORRECT: SUM(price) / SUM(floorArea)
avgPricePerM2 = totalPrice / totalFloorArea;

// ✅ CORRECT: SUM(price) / SUM(units)
avgPricePerUnit = totalPrice / (totalApartments + totalHouses);
```

**Why?** Imagine these sales:

- Sale A: 10m² at €100,000 = €10,000/m²
- Sale B: 100m² at €500,000 = €5,000/m²

- Wrong: `AVG(10000, 5000) = €7,500/m²`
- Right: `(100000 + 500000) / (10 + 100) = €5,454/m²`

The second is the true average price per m² across all sales.

---

## Schema Design

### Modular Approach

Schemas are built from composable pieces:

```typescript
BaseAggregationMetrics          // Common stats (count, price, area)
  ↓
PropertyTypeBreakdown           // Unit counts by type
  ↓
PropertyTypeStats               // Detailed stats per type
  ↓
SalesByInseeCodeSchema          // Final schema with all pieces
```

### Core Metrics (in every response)

```typescript
{
  count: number,              // Number of transactions
  totalPrice: number,         // Sum of all prices
  avgPrice: number,           // Average price
  minPrice: number,           // Minimum price
  maxPrice: number,           // Maximum price
  totalFloorArea: number,     // Sum of all floor areas
  avgFloorArea: number,       // Average floor area
  avgPricePerM2: number | null // Computed: totalPrice / totalFloorArea
}
```

### Optional Enhancements

Depending on the endpoint and use case, add:

```typescript
{
  // Property type breakdown
  propertyTypes: {
    totalApartments: number,
    totalHouses: number,
    totalWorkspaces: number,
    totalSecondaryUnits: number
  },

  // Detailed stats per property type
  apartmentStats: {
    count: number,
    avgPrice: number,
    avgPricePerM2: number
  },

  // Room distribution
  roomDistribution: {
    apartments: {
      oneRoom: number,
      twoRoom: number,
      // ...
    }
  }
}
```

### Query Parameters

All analytics endpoints support filtering:

```typescript
{
  // Time filters
  year?: number,
  startYear?: number,
  endYear?: number,
  startDate?: string,      // YYYY-MM-DD
  endDate?: string,        // YYYY-MM-DD

  // Location filters
  depCode?: string,
  inseeCode?: string,

  // Property type filters
  propertyTypeCode?: number,

  // Pagination
  limit?: number,          // default: 100, max: 1000
  offset?: number,         // default: 0

  // Sorting
  sortBy?: "count" | "totalPrice" | "avgPrice" | "avgPricePerM2",
  sortOrder?: "asc" | "desc"  // default: "desc"
}
```

---

## Implementation Guidelines

### Step-by-Step Implementation

1. **Define the route** in `analytics.routes.ts`

   ```typescript
   export const byInseeCode = createRoute({
     method: "get",
     path: "/analytics/by-insee-code",
     request: {
       query: AnalyticsQueryParamsSchema,
     },
     responses: {
       [HttpStatusCodes.OK]: jsonContent(
         z.array(SalesByInseeCodeSchema),
         "Sales grouped by INSEE code"
       ),
     },
   });
   ```

2. **Implement the handler** in `analytics.handlers.ts`

   ```typescript
   export const byInseeCode: AppRouteHandler<ByInseeCodeRoute> = async (c) => {
     const query = c.req.valid("query");

     // Build SQL query with filters
     const results = await db
       .select({
         inseeCode: propertySales.inseeCodes,
         count: sql<number>`count(*)`,
         totalPrice: sql<number>`sum(${propertySales.price})`,
         avgPrice: sql<number>`avg(${propertySales.price})`,
         // ... more aggregations
       })
       .from(propertySales)
       .where(/* apply filters from query */)
       .groupBy(propertySales.inseeCodes);

     return c.json(results, HttpStatusCodes.OK);
   };
   ```

3. **Test the endpoint** in `analytics.test.ts`

### SQL Best Practices

```sql
SELECT
  -- Group key
  insee_code,

  -- Aggregations
  COUNT(*) as count,
  SUM(valeurfonc) as totalPrice,
  AVG(valeurfonc) as avgPrice,
  MIN(valeurfonc) as minPrice,
  MAX(valeurfonc) as maxPrice,

  -- Computed (done in SQL for efficiency)
  CASE
    WHEN SUM(sbati) > 0
    THEN SUM(valeurfonc) / SUM(sbati)
    ELSE NULL
  END as avgPricePerM2

FROM property_sales
WHERE anneemut = 2023  -- Apply filters
GROUP BY insee_code
HAVING COUNT(*) >= 5   -- Optional: filter out groups with too few sales
ORDER BY count DESC
LIMIT 100;
```

---

## Performance Considerations

### Why Analytics Endpoints Are Fast

1. **Small result sets**

   - 500,000 sales → ~1,000 INSEE codes
   - 99.8% data reduction!

2. **Database does the heavy lifting**

   - Aggregation happens in PostgreSQL (optimized C code)
   - Only results are transferred over network

3. **Perfect for caching**
   - Results are stable (historical data doesn't change)
   - Can cache for hours/days
   - Small payload fits easily in Redis/CDN

### Caching Strategy

```typescript
// Public analytics - cache aggressively
GET /sales/analytics/by-insee-code
Cache-Control: public, max-age=3600     // 1 hour

// With filters - shorter cache
GET /sales/analytics/by-insee-code?year=2023
Cache-Control: public, max-age=1800     // 30 minutes

// Raw data - no cache or private
GET /sales
Cache-Control: private, max-age=300     // 5 minutes
```

### Database Optimization

1. **Indexes** (already exist in schema):

   ```typescript
   .on(table.date)           // For date filtering
   .on(table.depCode)        // For department grouping
   .on(table.year)           // For year filtering
   .on(table.price)          // For price sorting
   ```

2. **Materialized Views** (future optimization):

   ```sql
   CREATE MATERIALIZED VIEW sales_by_insee_code AS
   SELECT /* aggregation query */;

   REFRESH MATERIALIZED VIEW sales_by_insee_code;
   ```

3. **Partial Indexes** (for common queries):
   ```sql
   CREATE INDEX idx_sales_recent
   ON property_sales(anneemut, coddep)
   WHERE anneemut >= 2020;
   ```

---

## Summary

### Key Principles

1. **Aggregate in the database** - Let PostgreSQL do what it does best
2. **Compute ratios after aggregation** - Use weighted averages
3. **Design for caching** - Stable, small result sets
4. **Keep it simple** - Start with core metrics, add complexity as needed
5. **Type-safe schemas** - Let TypeScript catch errors

### Checklist for New Analytics Endpoint

- [ ] Define schema in `analytics.schemas.ts`
- [ ] Create route in `analytics.routes.ts`
- [ ] Implement handler in `analytics.handlers.ts`
- [ ] Add tests in `analytics.test.ts`
- [ ] Consider caching strategy
- [ ] Document in OpenAPI
- [ ] Verify performance with realistic data
- [ ] Add indexes if needed

---

## Questions?

This approach balances:

- ✅ REST conventions
- ✅ Performance
- ✅ Type safety
- ✅ Maintainability
- ✅ Scalability

Start simple, iterate based on real usage patterns.
