import {
  geometry,
  index,
  pgTable,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { communesGeom } from "./communes_geom";

export const sectionsGeom = pgTable(
  "sections_geom",
  {
    section: varchar("section", { length: 11 }).primaryKey(),
    inseeCode: varchar("insee_code", { length: 5 }).references(
      () => communesGeom.inseeCode,
      { onDelete: "cascade" }
    ),
    prefix: varchar("prefix", { length: 3 }),
    code: varchar("code", { length: 2 }),
    geom: geometry("geom", { type: "MultiPolygon", srid: 4326 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_sections_geom_insee_code").on(table.inseeCode),
    index("idx_sections_geom_geom_gist").using("gist", table.geom),
  ]
);
