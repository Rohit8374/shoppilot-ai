// ShopPilot AI — Example Prompts Component

const EXAMPLE_PROMPTS = [
  "Gaming phone under ₹25,000 with great camera",
  "Laptop for AI development under ₹70,000 with 16GB RAM",
  "Noise-cancelling headphones under ₹15,000",
  "Budget smartphone under ₹15,000 with long battery",
  "MacBook alternative for coding under ₹80,000",
];

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ExamplePrompts({ onSelect, disabled }: ExamplePromptsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Try an example
      </p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 hover:text-white hover:border-slate-600 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
