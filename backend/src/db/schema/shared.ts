import { integer, numeric, varchar } from "drizzle-orm/pg-core";

/**
 * Shared column definitions for aggregate metrics.
 */
export const aggregateColumns = {
  total_sales: integer("total_sales").notNull(),
  total_price: numeric("total_price", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  avg_price: numeric("avg_price", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  total_area: numeric("total_area", {
    precision: 10,
    scale: 1,
    mode: "number",
  }).notNull(),
  avg_area: numeric("avg_area", {
    precision: 10,
    scale: 1,
    mode: "number",
  }).notNull(),
  avg_price_m2: numeric("avg_price_m2", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  min_price: numeric("min_price", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  max_price: numeric("max_price", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  median_price: numeric("median_price", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  median_area: numeric("median_area", {
    precision: 10,
    scale: 1,
    mode: "number",
  }).notNull(),
  min_price_m2: numeric("min_price_m2", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  max_price_m2: numeric("max_price_m2", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  price_m2_p25: numeric("price_m2_p25", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  price_m2_p75: numeric("price_m2_p75", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  price_m2_iqr: numeric("price_m2_iqr", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
  price_m2_stddev: numeric("price_m2_stddev", {
    precision: 15,
    scale: 0,
    mode: "number",
  }).notNull(),
} as const;

/**
 * Apartment composition columns.
 */
export const apartmentCompositionColumns = {
  total_apartments: integer("total_apartments").notNull(),
  apartment_1_room: integer("apartment_1_room").notNull(),
  apartment_2_room: integer("apartment_2_room").notNull(),
  apartment_3_room: integer("apartment_3_room").notNull(),
  apartment_4_room: integer("apartment_4_room").notNull(),
  apartment_5_room: integer("apartment_5_room").notNull(),
} as const;

/**
 * House composition columns.
 */
export const houseCompositionColumns = {
  total_houses: integer("total_houses").notNull(),
  house_1_room: integer("house_1_room").notNull(),
  house_2_room: integer("house_2_room").notNull(),
  house_3_room: integer("house_3_room").notNull(),
  house_4_room: integer("house_4_room").notNull(),
  house_5_room: integer("house_5_room").notNull(),
} as const;
