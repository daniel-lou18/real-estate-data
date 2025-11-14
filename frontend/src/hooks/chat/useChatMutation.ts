import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/api";
import { chatQueryKeys } from "./queryKeys";
import type { ModelMessage } from "ai";
import type {
  DataChatResponse,
  IntentChatResponse,
} from "@/services/api/chatService";

/**
 * Custom hook for chat mutations using TanStack Query
 * Handles sending messages and updating query cache
 */
export function useChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messages: ModelMessage[]): Promise<DataChatResponse> => {
      return await chatService.sendMessage(messages);
    },
    onSuccess: (data) => {
      // Set messages in the conversation cache
      queryClient.setQueryData(chatQueryKeys.conversation(), data.messages);

      // Set data in the data cache
      queryClient.setQueryData(chatQueryKeys.data(), data.data || []);
    },
    onError: (error) => {
      console.error("Chat mutation error:", error);
    },
  });
}

export function useIntentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      messages: ModelMessage[]
    ): Promise<IntentChatResponse> => {
      return await chatService.getIntent(messages);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(chatQueryKeys.conversation(), data.messages);
      queryClient.setQueryData(chatQueryKeys.intent(), data.data || {});
    },
    onError: (error) => {
      console.error("Intent mutation error:", error);
    },
  });
}
