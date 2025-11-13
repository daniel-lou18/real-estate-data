interface LoadingIndicatorProps {
  isProcessing: boolean;
}

export function LoadingIndicator({ isProcessing }: LoadingIndicatorProps) {
  if (!isProcessing) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 border px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
          <span>Processing your request...</span>
        </div>
      </div>
    </div>
  );
}
