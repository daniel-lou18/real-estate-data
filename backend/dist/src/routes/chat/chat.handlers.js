import * as HttpStatusCodes from "@/config/http-status-codes";
import { generateSqlQuery } from "@/services/llm/generateSqlQuery";
import { generateIntent } from "@/services/classify-intent/generateIntent";
export const chat = async (c) => {
    const { messages } = c.req.valid("json");
    const data = await generateSqlQuery(messages);
    const successMessage = {
        role: "assistant",
        content: `Successfully retrieved ${data.length} rows`,
    };
    return c.json({ messages: [successMessage, ...messages], data }, HttpStatusCodes.OK);
};
export const intent = async (c) => {
    const { messages } = c.req.valid("json");
    const intent = await generateIntent(messages);
    const successMessage = {
        role: "assistant",
        content: `Successfully retrieved intent: ${intent}`,
    };
    return c.json({ messages: [successMessage, ...messages], data: intent }, HttpStatusCodes.OK);
};
