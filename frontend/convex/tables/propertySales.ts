import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export const propertySales = defineTable({
  // Clean field names mapping from dvfPropertySales
  id: v.string(),
  inseeCode: v.string(),
  section: v.string(),
  year: v.number(),
  month: v.number(),
  date: v.string(),
  mutationType: v.string(),
  propertyType: v.string(),
  propertyTypeCode: v.number(),
  price: v.union(v.number(), v.null()),
  floorArea: v.number(),
  numberOfStudioApartments: v.number(),
  numberOf1BedroomApartments: v.number(),
  numberOf2BedroomApartments: v.number(),
  numberOf3BedroomApartments: v.number(),
  numberOf4BedroomApartments: v.number(),
  numberOfWorkspaces: v.number(),
  numberOfAppartments: v.number(),
  numberOfHouses: v.number(),
  numberOfSecondaryUnits: v.number(),
  numberOfStudioHouses: v.number(),
  numberOf1BedroomHouses: v.number(),
  numberOf2BedroomHouses: v.number(),
  numberOf3BedroomHouses: v.number(),
  numberOf4BedroomHouses: v.number(),
});

export type PropertySales = Doc<"propertySales">;
