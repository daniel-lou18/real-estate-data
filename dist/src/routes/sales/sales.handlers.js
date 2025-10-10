import * as HttpStatusCodes from "@/config/http-status-codes";
import * as HttpStatusPhrases from "@/config/http-status-phrases";
import { db } from "@/db";
import { propertySales } from "@/db/schema";
import { eq } from "drizzle-orm";
export const list = async (c) => {
    const sales = await db.select().from(propertySales).limit(10);
    return c.json(sales, HttpStatusCodes.OK);
};
export const getOne = async (c) => {
    const id = c.req.valid("param").id;
    const sale = await db.query.propertySales.findFirst({
        where: eq(propertySales.id, id),
    });
    if (!sale) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(sale, HttpStatusCodes.OK);
};
