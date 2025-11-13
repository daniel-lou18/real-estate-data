import { defineSchema } from "convex/server";
import { dvfPropertySales } from "./tables/dvfPropertySales";
import { propertySales } from "./tables/propertySales";

export default defineSchema({
  mutations_75: dvfPropertySales,
  propertySales: propertySales,
});
