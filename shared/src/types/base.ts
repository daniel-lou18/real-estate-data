/**
 * Base utility types that don't depend on constants or other domain types.
 *
 * This file is for types that are completely independent and can be used
 * across the codebase without creating circular dependencies.
 *
 * Examples of what could go here:
 * - Generic utility types (e.g., DeepPartial, DeepRequired)
 * - Common type helpers (e.g., NonEmptyArray, Branded types)
 * - Shared primitive type aliases
 *
 * Currently empty - add utility types here as needed.
 */

// Example utility types (uncomment and use as needed):
// export type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
// };
//
// export type NonEmptyArray<T> = [T, ...T[]];
//
// export type Brand<T, B> = T & { __brand: B };
