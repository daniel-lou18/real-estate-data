import { geometry, index, pgTable, text, varchar, timestamp, } from "drizzle-orm/pg-core";
export const communesGeom = pgTable("communes_geom", {
    inseeCode: varchar("insee_code", { length: 5 }).primaryKey(),
    name: text("name"),
    geom: geometry("geom", { type: "MultiPolygon", srid: 4326 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [index("idx_communes_geom_geom_gist").using("gist", table.geom)]);
