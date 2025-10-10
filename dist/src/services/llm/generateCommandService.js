import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import env from "@/config/env";
// const google = createGoogleGenerativeAI({
//   apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
// });
const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
});
export async function generateCommandService(prompt, system, tools, options) {
    const result = await generateText({
        model: openai("gpt-5-mini"),
        system,
        prompt,
        tools,
        ...(options?.requireTool ? { toolChoice: "required" } : {}),
    });
    for (const toolCall of result.toolCalls) {
        console.log("toolCall", toolCall.toolName);
    }
    // Process the unified tool result
    for (const toolResult of result.toolResults) {
        if (toolResult.dynamic) {
            continue;
        }
        if (toolResult.toolName in tools) {
            const result = toolResult.output;
            console.log("result", result);
            return result;
        }
    }
    return {
        success: false,
        text: "No tool was executed",
        outputText: result.text,
        toolCalls: result.toolCalls,
    };
}
