import { useState } from "react";

interface MessageInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}

export function MessageInput({ onSubmit, isProcessing }: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSubmit(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isProcessing) {
        onSubmit(input);
        setInput("");
      }
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-blue-300">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start typing your query..."
              disabled={isProcessing}
              rows={1}
              className="w-full px-4 py-3 pr-14 resize-none border-0 rounded-2xl placeholder-gray-500 focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 leading-6"
              style={{
                minHeight: "48px",
                maxHeight: "200px",
                overflow: "auto",
              }}
            />
          </div>

          <div className="flex items-center pr-3">
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-gray-300"
            >
              {isProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
