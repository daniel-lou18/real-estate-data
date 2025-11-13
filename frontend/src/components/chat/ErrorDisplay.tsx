interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="text-red-800 text-sm">{error}</div>
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
