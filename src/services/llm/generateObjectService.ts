import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import env from "@/config/env";
import z from "zod";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function generateObjectService<T extends z.ZodType>(
  prompt: string,
  system: string,
  schema: T
) {
  try {
    const result = await generateObject({
      model: openai("gpt-5-mini"),
      system,
      prompt,
      schema,
    });
    console.log("result", result.object);
    return result.object as z.infer<T>;
  } catch (error) {
    console.error(error);
    throw new Error(
      error instanceof z.ZodError
        ? z.prettifyError(error)
        : "Failed to generate object"
    );
  }
}
