import { getSalesByInseeCode, getSalesByMonth, getSalesByPropertyType, getSalesByInseeCodeAndSection, getSalesByYear, getSalesSummary, } from "../../../repositories/analytics.queries";
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
