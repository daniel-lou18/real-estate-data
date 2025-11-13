/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as lib_dataTransformers from "../lib/dataTransformers.js";
import type * as lib_validators from "../lib/validators.js";
import type * as tables_dvfPropertySales from "../tables/dvfPropertySales.js";
import type * as tables_propertySales from "../tables/propertySales.js";
import type * as types_PropertySales from "../types/PropertySales.js";
import type * as types_index from "../types/index.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "lib/dataTransformers": typeof lib_dataTransformers;
  "lib/validators": typeof lib_validators;
  "tables/dvfPropertySales": typeof tables_dvfPropertySales;
  "tables/propertySales": typeof tables_propertySales;
  "types/PropertySales": typeof types_PropertySales;
  "types/index": typeof types_index;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
