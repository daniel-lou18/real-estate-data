/**
 * Query keys for chat functionality
 * Following the established pattern in the project
 */

export const chatQueryKeys = {
  all: ["chat"] as const,
  lists: () => [...chatQueryKeys.all, "list"] as const,
  list: (filters: string) => [...chatQueryKeys.lists(), { filters }] as const,
  details: () => [...chatQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...chatQueryKeys.details(), id] as const,
  messages: (conversationId: string) =>
    [...chatQueryKeys.all, "messages", conversationId] as const,
  // New keys for cache-based state management
  conversation: () => [...chatQueryKeys.all, "conversation"] as const,
  data: () => [...chatQueryKeys.all, "data"] as const,
} as const;
