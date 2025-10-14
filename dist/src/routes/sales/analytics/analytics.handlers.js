import { getSalesByInseeCode, getSalesByMonth, getSalesByPropertyType, getSalesByInseeCodeAndSection, getSalesByYear, getSalesSummary, getPricePerM2Deciles, getPricePerM2DecilesByInseeCode, getPricePerM2DecilesByInseeCodeAndSection, } from "../../../repositories/analytics.queries";
import * as HttpStatusCodes from "@/config/http-status-codes";
export const groupedByInseeCode = async (c) => {
    const query = c.req.valid("query");
    const results = await getSalesByInseeCode(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const groupedByInseeCodeAndSection = async (c) => {
    const query = c.req.valid("query");
    const results = await getSalesByInseeCodeAndSection(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const groupedByPropertyType = async (c) => {
    const query = c.req.valid("query");
    const results = await getSalesByPropertyType(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const groupedByYear = async (c) => {
    const query = c.req.valid("query");
    const results = await getSalesByYear(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const groupedByMonth = async (c) => {
    const query = c.req.valid("query");
    const results = await getSalesByMonth(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const summary = async (c) => {
    const query = c.req.valid("query");
    const results = await getSalesSummary(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const pricePerM2Deciles = async (c) => {
    const query = c.req.valid("query");
    const results = await getPricePerM2Deciles(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const pricePerM2DecilesByInseeCode = async (c) => {
    const query = c.req.valid("query");
    const results = await getPricePerM2DecilesByInseeCode(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const pricePerM2DecilesByInseeCodeAndSection = async (c) => {
    const query = c.req.valid("query");
    const results = await getPricePerM2DecilesByInseeCodeAndSection(query);
    return c.json(results, HttpStatusCodes.OK);
};
