import { type Table } from "@tanstack/react-table";
import { MessagesList } from "./MessagesList";
import { ErrorDisplay } from "./ErrorDisplay";
import { MessageInput } from "./MessageInput";
import { ClearChatButton } from "./ClearChatButton";
import type { TableData } from "@/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  error: string | null;
  setError: (error: string | null) => void;
  input: string;
  setInput: (input: string) => void;
  onSubmit: (message: string) => void;
  isProcessing: boolean;
  onClear: () => void;
  data: TableData[];
  table: Table<TableData>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatInterface({
  messages,
  error,
  setError,
  input,
  setInput,
  onSubmit,
  isProcessing,
  onClear,
}: ChatInterfaceProps) {
  // Table operations hook - handles all business logic

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center">
          <span className="mr-2">🧠</span>
          Data Assistant
        </h3>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col p-4 space-y-4">
          <MessagesList messages={messages} />
          <ErrorDisplay error={error} onDismiss={() => setError(null)} />
          <div className="space-y-3">
            <MessageInput
              input={input}
              setInput={setInput}
              onSubmit={onSubmit}
              isProcessing={isProcessing}
            />
            <ClearChatButton onClear={onClear} isProcessing={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}
