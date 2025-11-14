import type { AppRouteHandler } from "@/types";
import type { ChatRoute, IntentRoute } from "./chat.routes";
import * as HttpStatusCodes from "@/config/http-status-codes";
import { generateSqlQuery } from "@/services/llm/generateSqlQuery";
import type { AssistantModelMessage, ModelMessage } from "ai";
import { generateIntent } from "@/services/classify-intent/generateIntent";

export const chat: AppRouteHandler<ChatRoute> = async (c) => {
  const { messages } = c.req.valid("json");

  const data = await generateSqlQuery(messages);

  const successMessage: AssistantModelMessage = {
    role: "assistant",
    content: `Successfully retrieved ${data.length} rows`,
  };

  return c.json(
    { messages: [successMessage, ...messages], data },
    HttpStatusCodes.OK
  );
};

export const intent: AppRouteHandler<IntentRoute> = async (c) => {
  const { messages } = c.req.valid("json");

  const intent = await generateIntent(messages);

  const successMessage: AssistantModelMessage = {
    role: "assistant",
    content: `Successfully retrieved intent: ${intent}`,
  };

  return c.json(
    { messages: [successMessage, ...messages], data: intent },
    HttpStatusCodes.OK
  );
};
