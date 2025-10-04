import { generateCommandService } from "./generateCommandService";
import {
  querySystemPrompt,
  aggregationSystemPrompt,
  intentSystemPrompt,
} from "./systemPrompts";
import { classifyIntent, executeAggregation, executeQuery } from "./tools";
import type { Intent } from "./schemas";

export async function planOperation(prompt: string) {
  const intent = (await generateCommandService(
    prompt,
    intentSystemPrompt,
    { classifyIntent },
    { requireTool: true }
  )) as Intent;

  console.log("intent", intent);

  if (intent.category === "query") {
    return await generateCommandService(
      prompt,
      querySystemPrompt,
      { executeQuery },
      { requireTool: true }
    );
  }

  if (intent.category === "aggregate") {
    return await generateCommandService(
      prompt,
      aggregationSystemPrompt,
      { executeAggregation },
      { requireTool: true }
    );
  }

  return {
    success: false,
    text: `Unsupported or unclear intent: ${intent.category}`,
    intent,
  };
}
