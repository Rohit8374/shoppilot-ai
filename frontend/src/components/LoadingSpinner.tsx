// ShopPilot AI — Loading Spinner Component

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Analyzing your requirements…" }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in">
      {/* Spinner rings */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-indigo-400/50 animate-spin [animation-duration:1.5s]" />
      </div>

      {/* Agent status text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-300">{message}</p>
        <p className="text-xs text-slate-500">Intent Agent is processing your query</p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
