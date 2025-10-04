import { generateCommandService } from "@/services/llm/generateCommandService";
import type { AppRouteHandler } from "@/types";
import type { ChatRoute } from "./chat.routes";
import * as HttpStatusCodes from "@/config/http-status-codes";
import { planOperation } from "@/services/llm/planOperation";

export const chat: AppRouteHandler<ChatRoute> = async (c) => {
  const { messages } = c.req.valid("json");
  const prompt = messages.map((message) => message.content).join("\n");

  console.log("prompt", prompt);

  const result = await planOperation(prompt);

  return c.json(
    { messages: [{ role: "assistant", content: JSON.stringify(result) }] },
    HttpStatusCodes.OK
  );
};
