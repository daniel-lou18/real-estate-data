# Analytics Endpoints

This directory contains the analytics API for property sales data - providing aggregated insights and statistics.

## 📁 Files

- **`analytics.schemas.ts`** - Zod schemas for analytics responses and query parameters
- **`analytics.routes.ts`** - OpenAPI route definitions for all analytics endpoints
- **`analytics.handlers.ts`** - Handler implementations with database queries
- **`analytics.index.ts`** - Router that combines routes and handlers
- **`analytics.test.ts`** - Tests for analytics endpoints
- **`ANALYTICS_APPROACH.md`** - Detailed documentation of design philosophy and implementation

## 🚀 Quick Start

### 1. Read the Approach Document First

Start with [`ANALYTICS_APPROACH.md`](./ANALYTICS_APPROACH.md) to understand:

- Why we separate raw data from analytics
- How aggregation works
- Schema design principles
- Implementation guidelines

### 2. Use the Schemas

Import schemas in your routes:

```typescript
import {
  SalesByInseeCodeSchema,
  SalesByInseeCodeAndSectionSchema,
  AnalyticsQueryParamsSchema,
} from "./analytics.schemas";
```

All schemas are:

- ✅ Type-safe with TypeScript
- ✅ Self-documenting with descriptions
- ✅ Validated with Zod
- ✅ OpenAPI compatible

### 3. Available Schemas

#### Response Schemas

- `SalesByInseeCodeSchema` - Sales grouped by postal code
- `SalesByInseeCodeAndSectionSchema` - Sales grouped by postal code + section
- `SalesByPropertyTypeSchema` - Sales grouped by property type
- `SalesByYearSchema` - Sales grouped by year
- `SalesByMonthSchema` - Sales grouped by month
- `SalesSummarySchema` - Overall statistics (no grouping)

#### Query Parameters

- `AnalyticsQueryParamsSchema` - Common filters for all analytics endpoints
  - Time filters: `year`, `startYear`, `endYear`, `startDate`, `endDate`
  - Location filters: `depCode`, `inseeCode`, `section`
  - Property filters: `propertyTypeCode`
  - Pagination: `limit`, `offset`
  - Sorting: `sortBy`, `sortOrder`

## 📊 Core Metrics

Every analytics response includes:

```typescript
{
  count: number,              // Number of transactions
  totalPrice: number,         // Sum of all prices
  avgPrice: number,           // Average price
  minPrice: number,           // Minimum price
  maxPrice: number,           // Maximum price
  totalFloorArea: number,     // Sum of all floor areas
  avgFloorArea: number,       // Average floor area
  avgPricePerM2: number | null // Price per m² (computed)
}
```

## 🔑 Key Concepts

### Aggregation vs. Raw Data

```
/sales                    → Raw records (500k+)
/sales/analytics/*        → Aggregated data (~100-1000 records)
```

### Computed Metrics

Some fields are **computed after aggregation**:

```typescript
// ❌ Wrong: AVG(price / floorArea)
// ✅ Right: SUM(price) / SUM(floorArea)
avgPricePerM2 = totalPrice / totalFloorArea;
```

See [ANALYTICS_APPROACH.md](./ANALYTICS_APPROACH.md#aggregation-rules) for details.

## 📖 Next Steps

1. Read [`ANALYTICS_APPROACH.md`](./ANALYTICS_APPROACH.md)
2. Implement handlers in `analytics.handlers.ts`
3. Wire up routes in `analytics.index.ts`
4. Add tests in `analytics.test.ts`
5. Mount router in `/sales` route

## 🎯 Design Goals

- ✅ **Small result sets** - Perfect for caching
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Flexible** - Query parameters for filtering
- ✅ **RESTful** - Clear resource structure
- ✅ **Fast** - Database does aggregation
- ✅ **Documented** - Self-documenting schemas

---

For detailed implementation guidelines, see [`ANALYTICS_APPROACH.md`](./ANALYTICS_APPROACH.md).
