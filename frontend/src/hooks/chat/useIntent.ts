import { useState, useCallback } from "react";
import { useIntentMutation } from "./useChatMutation";
import type { ModelMessage } from "ai";
import type { UserIntent } from "@/types";

/**
 * Simple chat hook that manages state locally but uses mutations for API calls
 * This avoids the infinite re-render issues with cache-based approaches
 */
export function useIntent() {
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const intentMutation = useIntentMutation();

  // Add a message to the conversation
  const addMessage = useCallback(
    (
      role: "user" | "assistant",
      content: string,
      messageData?: any[]
    ): ModelMessage => {
      const newMessage: ModelMessage = {
        role,
        content,
        ...(messageData && { data: messageData }),
      };

      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    []
  );

  // Clear the entire conversation
  const clearChat = useCallback(() => {
    setMessages([]);
    setIntent(null);
  }, []);

  // Send a message (triggers mutation)
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      // Add user message immediately
      const userMessage = addMessage("user", message);

      // Create conversation array for the API
      const conversation = [...messages, userMessage];

      // Trigger mutation
      intentMutation.mutate(conversation, {
        onSuccess: (result) => {
          // Update local state with server response
          setMessages(result.messages);
          setIntent(result.data || null);
        },
        onError: (error) => {
          console.error("Error processing message:", error);
        },
      });
    },
    [addMessage, messages, intentMutation]
  );

  return {
    // Local state (simple and reliable)
    messages,
    intent,
    isProcessing: intentMutation.isPending,
    error: intentMutation.error,

    // Actions
    addMessage,
    clearChat,
    handleSendMessage,
  };
}
