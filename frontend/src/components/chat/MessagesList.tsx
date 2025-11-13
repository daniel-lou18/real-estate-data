interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessagesListProps {
  messages: ChatMessage[];
}

export function MessagesList({ messages }: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg border">
      {messages.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-4">
          💬 Ask me to sort, filter, select, or group your data!
          <br />
          <span className="text-xs">
            Try: "Sort by price high to low", "Show cities starting with A",
            "Select all rows", or "Group by province"
          </span>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border"
              }`}
            >
              <div className="font-medium text-xs opacity-70 mb-1">
                {message.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
