// ShopPilot AI — Error Message Component

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 flex items-start gap-3 animate-fade-in">
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-red-900/60 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-red-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-300">Something went wrong</p>
        <p className="text-sm text-red-400/80 mt-0.5 break-words">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-xs font-medium text-red-400 hover:text-red-300 border border-red-700/50 hover:border-red-600 rounded-lg px-3 py-1.5 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
