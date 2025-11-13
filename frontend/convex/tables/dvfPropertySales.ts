import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export const dvfPropertySales = defineTable({
  idmutation: v.number(),
  l_codinsee: v.string(),
  l_section: v.string(),
  anneemut: v.number(),
  datemut: v.string(),
  libnatmut: v.string(),
  codtypbien: v.number(),
  libtypbien: v.string(),
  moismut: v.number(),
  nbapt1pp: v.number(),
  nbapt2pp: v.number(),
  nbapt3pp: v.number(),
  nbapt4pp: v.number(),
  nbapt5pp: v.number(),
  nblocact: v.number(),
  nblocapt: v.number(),
  nblocdep: v.number(),
  nblocmai: v.number(),
  nbmai1pp: v.number(),
  nbmai2pp: v.number(),
  nbmai3pp: v.number(),
  nbmai4pp: v.number(),
  nbmai5pp: v.number(),
  sbati: v.number(),
  valeurfonc: v.union(v.number(), v.string()),
});

export type DvfPropertySales = Doc<"mutations_75">;
