import * as HttpStatusCodes from "@/config/http-status-codes";
import { getAptsByInseeMonth, getAptsByInseeWeek, getAptsByInseeYear, getHousesByInseeMonth, getHousesByInseeWeek, getHousesByInseeYear, } from "@/repositories/mv.analytics";
export const getAptsByInseeCodeYear = async (c) => {
    const query = c.req.valid("query");
    const results = await getAptsByInseeYear(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const getHousesByInseeCodeYear = async (c) => {
    const query = c.req.valid("query");
    const results = await getHousesByInseeYear(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const getAptsByInseeCodeMonth = async (c) => {
    const query = c.req.valid("query");
    const results = await getAptsByInseeMonth(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const getHousesByInseeCodeMonth = async (c) => {
    const query = c.req.valid("query");
    const results = await getHousesByInseeMonth(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const getAptsByInseeCodeWeek = async (c) => {
    const query = c.req.valid("query");
    const results = await getAptsByInseeWeek(query);
    return c.json(results, HttpStatusCodes.OK);
};
export const getHousesByInseeCodeWeek = async (c) => {
    const query = c.req.valid("query");
    const results = await getHousesByInseeWeek(query);
    return c.json(results, HttpStatusCodes.OK);
};
