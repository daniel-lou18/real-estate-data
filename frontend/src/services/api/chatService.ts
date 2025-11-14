import type { TableData, UserIntent } from "@/types";
import { apiService } from "./baseApiService";
import type { ModelMessage } from "ai";

type ChatResponse<TData> = {
  messages: ModelMessage[];
  data: TData;
};

export type DataChatResponse = ChatResponse<TableData[]>;
export type IntentChatResponse = ChatResponse<UserIntent>;

/**
 * Chat API service for handling chat-related requests
 */
export class ChatService {
  private api: typeof apiService;

  constructor(api = apiService) {
    this.api = api;
  }

  /**
   * Send a chat message and get AI response
   *
   * @param messages - Array of chat messages
   * @returns Promise<DataMessage> - AI response with data
   */
  async sendMessage(messages: ModelMessage[]): Promise<DataChatResponse> {
    try {
      const response = await this.api.post<DataChatResponse>("/chat", {
        messages,
      });

      return response.data;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  }

  async getIntent(messages: ModelMessage[]): Promise<IntentChatResponse> {
    try {
      const response = await this.api.post<IntentChatResponse>("/chat/intent", {
        messages,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting intent:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
