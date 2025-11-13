import { generateCommandService } from "./generateCommandService";
import { querySystemPrompt, aggregationSystemPrompt, computationSystemPrompt, intentSystemPrompt, } from "./systemPrompts";
import { classifyIntent, executeAggregation, executeQuery, executeComputation, } from "./tools";
export async function planOperation(prompt) {
    const intent = (await generateCommandService(prompt, intentSystemPrompt, { classifyIntent }, { requireTool: true }));
    console.log("intent", intent);
    if (intent.category === "query") {
        return await generateCommandService(prompt, querySystemPrompt, { executeQuery }, { requireTool: true });
    }
    if (intent.category === "aggregate") {
        return await generateCommandService(prompt, aggregationSystemPrompt, { executeAggregation }, { requireTool: true });
    }
    if (intent.category === "compute") {
        return await generateCommandService(prompt, computationSystemPrompt, { executeComputation }, { requireTool: true });
    }
    return {
        success: false,
        text: `Unsupported or unclear intent: ${intent.category}`,
        intent,
    };
}
