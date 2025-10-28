import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import env from "@/config/env";
import z from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
});
const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});
export async function generateObjectService(messages, system, schema) {
    try {
        const result = await generateObject({
            model: google("gemini-2.5-flash-preview-09-2025"),
            system,
            messages,
            schema,
        });
        console.log("result", result.object);
        return result.object;
    }
    catch (error) {
        console.error(error);
        throw new Error(error instanceof z.ZodError
            ? z.prettifyError(error)
            : "Failed to generate object");
    }
}
