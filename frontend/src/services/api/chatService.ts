import type { TableData } from "@/types";
import { apiService } from "./baseApiService";
import type { ModelMessage } from "ai";

export type DataChatResponse = {
  messages: ModelMessage[];
  data: TableData[];
};

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
}

export const chatService = new ChatService();
