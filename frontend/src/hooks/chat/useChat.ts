import { useState, useCallback } from "react";
import { useChatMutation } from "./useChatMutation";
import type { ModelMessage } from "ai";

/**
 * Simple chat hook that manages state locally but uses mutations for API calls
 * This avoids the infinite re-render issues with cache-based approaches
 */
export function useChat() {
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [data, setData] = useState<any[]>([]);
  const chatMutation = useChatMutation();

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
    setData([]);
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
      chatMutation.mutate(conversation, {
        onSuccess: (result) => {
          // Update local state with server response
          setMessages(result.messages);
          setData(result.data || []);
        },
        onError: (error) => {
          console.error("Error processing message:", error);
        },
      });
    },
    [addMessage, messages, chatMutation]
  );

  return {
    // Local state (simple and reliable)
    messages,
    data,
    isProcessing: chatMutation.isPending,
    error: chatMutation.error,

    // Actions
    addMessage,
    clearChat,
    handleSendMessage,
  };
}
