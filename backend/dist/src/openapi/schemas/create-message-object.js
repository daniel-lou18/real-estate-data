import { z } from "@hono/zod-openapi";
const createMessageObjectSchema = (exampleMessage = "Hello, world!") => {
    return z
        .object({
        message: z.string(),
    })
        .openapi({
        example: {
            message: exampleMessage,
        },
    });
};
export default createMessageObjectSchema;
