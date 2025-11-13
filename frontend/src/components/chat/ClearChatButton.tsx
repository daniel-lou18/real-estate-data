interface ClearChatButtonProps {
  onClear: () => void;
  isProcessing: boolean;
}

export function ClearChatButton({
  onClear,
  isProcessing,
}: ClearChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      disabled={isProcessing}
      className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
    >
      Clear Chat
    </button>
  );
}
