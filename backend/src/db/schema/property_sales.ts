import { SQL, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const propertyTypeLabelEnum = pgEnum("property_type_label", [
  "ACTIVITE",
  "APPARTEMENT INDETERMINE",
  "BATI - INDETERMINE : Vefa sans descriptif",
  "BATI - INDETERMINE : Vente avec volume(s)",
  "BATI MIXTE - LOGEMENT/ACTIVITE",
  "BATI MIXTE - LOGEMENTS",
  "DES DEPENDANCES",
  "DES MAISONS",
  "DEUX APPARTEMENTS",
  "MAISON - INDETERMINEE",
  "TERRAIN ARTIFICIALISE MIXTE",
  "TERRAIN D'AGREMENT",
  "TERRAIN DE TYPE RESEAU",
  "TERRAIN DE TYPE TAB",
  "UN APPARTEMENT",
  "UNE DEPENDANCE",
  "UNE MAISON",
]);

export const propertySales = pgTable(
  "property_sales",
  {
    // IDs
    id: integer("idmutation").primaryKey(),
    idmutinvar: varchar("idmutinvar", { length: 50 }),
    idopendata: varchar("idopendata", { length: 50 }),
    idnatmut: smallint("idnatmut"),
    codservch: varchar("codservch", { length: 10 }),
    refdoc: varchar("refdoc", { length: 50 }),

    // Dates
    date: date("datemut"),
    year: smallint("anneemut"),
    month: smallint("moismut"),
    depCode: varchar("coddep", { length: 5 }),

    // Transaction details
    libnatmut: varchar("libnatmut", { length: 100 }),
    vefa: boolean("vefa"),
    price: numeric("valeurfonc", { precision: 12, scale: 2, mode: "number" }),

    // Counts
    nbdispo: smallint("nbdispo"),
    nblot: smallint("nblot"),
    nbcomm: smallint("nbcomm"),

    // Location arrays (stored as JSONB)
    inseeCodes: jsonb("l_codinsee").$type<string[]>(),
    // Add generated column
    primaryInseeCode: varchar("primary_insee_code", {
      length: 10,
    }).generatedAlwaysAs((): SQL => sql`l_codinsee->>0`),
    nbsection: smallint("nbsection"),
    sections: jsonb("l_section").$type<string[]>(),
    primarySection: varchar("primary_section", {
      length: 5,
    }).generatedAlwaysAs((): SQL => sql`l_section->>0`),
    nbpar: smallint("nbpar"),
    lIdpar: jsonb("l_idpar").$type<string[]>(),
    primaryParcelId: varchar("primary_parcel_id", {
      length: 15,
    }).generatedAlwaysAs((): SQL => sql`l_idpar->>0`),
    nbparmut: smallint("nbparmut"),
    lIdparmut: jsonb("l_idparmut").$type<string[]>(),

    // Property details
    nbsuf: smallint("nbsuf"),
    sterr: numeric("sterr", { precision: 10, scale: 2, mode: "number" }),
    nbvolmut: smallint("nbvolmut"),
    nbProperties: smallint("nblocmut"),
    lIdlocmut: jsonb("l_idlocmut").$type<string[]>(),

    // Property type counts
    nbHouses: smallint("nblocmai"),
    nbApartments: smallint("nblocapt"),
    nbSecondaryUnits: smallint("nblocdep"),
    nbWorkspaces: smallint("nblocact"),

    // Apartment room counts
    nbapt1pp: smallint("nbapt1pp"),
    nbapt2pp: smallint("nbapt2pp"),
    nbapt3pp: smallint("nbapt3pp"),
    nbapt4pp: smallint("nbapt4pp"),
    nbapt5pp: smallint("nbapt5pp"),

    // House room counts
    nbmai1pp: smallint("nbmai1pp"),
    nbmai2pp: smallint("nbmai2pp"),
    nbmai3pp: smallint("nbmai3pp"),
    nbmai4pp: smallint("nbmai4pp"),
    nbmai5pp: smallint("nbmai5pp"),

    // Surface areas (m²)
    floorArea: numeric("sbati", { precision: 10, scale: 2, mode: "number" }),
    HouseFloorArea: numeric("sbatmai", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    ApartmentFloorArea: numeric("sbatapt", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    WorkspaceFloorArea: numeric("sbatact", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    sapt1pp: numeric("sapt1pp", { precision: 10, scale: 2, mode: "number" }),
    sapt2pp: numeric("sapt2pp", { precision: 10, scale: 2, mode: "number" }),
    sapt3pp: numeric("sapt3pp", { precision: 10, scale: 2, mode: "number" }),
    sapt4pp: numeric("sapt4pp", { precision: 10, scale: 2, mode: "number" }),
    sapt5pp: numeric("sapt5pp", { precision: 10, scale: 2, mode: "number" }),
    smai1pp: numeric("smai1pp", { precision: 10, scale: 2, mode: "number" }),
    smai2pp: numeric("smai2pp", { precision: 10, scale: 2, mode: "number" }),
    smai3pp: numeric("smai3pp", { precision: 10, scale: 2, mode: "number" }),
    smai4pp: numeric("smai4pp", { precision: 10, scale: 2, mode: "number" }),
    smai5pp: numeric("smai5pp", { precision: 10, scale: 2, mode: "number" }),

    // Property type
    propertyTypeCode: smallint("codtypbien"),
    propertyTypeLabel: propertyTypeLabelEnum("libtypbien"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    datemutIdx: index("idx_property_sales_datemut").on(table.date),
    coddepIdx: index("idx_property_sales_coddep").on(table.depCode),
    anneemutIdx: index("idx_property_sales_anneemut").on(table.year),
    codtypbienIdx: index("idx_property_sales_codtypbien").on(
      table.propertyTypeCode
    ),
    valeurioncIdx: index("idx_property_sales_valeurfonc").on(table.price),
  })
);

export type SelectPropertySale = typeof propertySales.$inferSelect;
export type InsertPropertySale = typeof propertySales.$inferInsert;

export const SelectPropertySaleSchema = createSelectSchema(propertySales);
export const InsertPropertySaleSchema = createInsertSchema(propertySales);
