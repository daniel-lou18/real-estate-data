import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import * as HttpStatusCodes from "@/config/http-status-codes";
import { createRoute, z } from "@hono/zod-openapi";
const tags = ["Chat"];
export const chat = createRoute({
    tags,
    method: "post",
    path: "/chat",
    request: {
        body: jsonContentRequired(z.object({
            messages: z.array(z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
            })),
        }), "The chat messages to send to the assistant"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.object({
            messages: z.array(z.object({
                role: z.enum(["user", "assistant"]),
                content: z.array(z.record(z.string(), z.any())),
            })),
        }), "The chat messages received from the assistant"),
    },
});
