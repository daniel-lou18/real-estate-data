# @app/shared

Shared package for the real-estate-monorepo containing types, schemas, and constants used by both frontend and backend.

## Structure

```
src/
├── types/          # TypeScript type definitions
├── schemas/        # Zod validation schemas
└── constants/      # Shared constants and catalogs
```

## Usage

This package is consumed by both the `frontend` and `backend` packages in the monorepo.

```typescript
import { MetricField, METRIC_CATALOG } from "@app/shared";
import { AggregateMetricsMVSchema } from "@app/shared";
import type { MapFeature } from "@app/shared";
```

## Development

### Build

```bash
npm run build
```

### Clean

```bash
npm run clean
```

## Exports

- **Types**: All TypeScript types from `src/types/`
- **Schemas**: All Zod schemas from `src/schemas/`
- **Constants**: Base constants and catalogs from `src/constants/`
