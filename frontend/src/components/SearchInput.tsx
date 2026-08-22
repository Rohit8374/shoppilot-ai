// ShopPilot AI — Search Input Component

import { useRef, useEffect } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function SearchInput({ value, onChange, onSubmit, loading }: SearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim().length >= 3) onSubmit();
    }
  };

  const charCount = value.length;
  const isValid = charCount >= 3 && charCount <= 1000;
  const tooLong = charCount > 1000;

  return (
    <div className="space-y-3">
      {/* Textarea wrapper */}
      <div
        className={`relative rounded-xl border transition-all duration-200 bg-slate-800/70 ${
          tooLong
            ? "border-red-600/70 shadow-sm shadow-red-500/10"
            : "border-slate-600/60 focus-within:border-indigo-500/70 focus-within:shadow-lg focus-within:shadow-indigo-500/10"
        }`}
      >
        <textarea
          ref={textareaRef}
          id="shopping-query"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={3}
          placeholder="Describe what you're looking for… e.g. &quot;I need a laptop for coding under ₹70,000 with 16GB RAM&quot;"
          className="w-full bg-transparent px-4 pt-4 pb-12 text-sm text-slate-100 placeholder-slate-500 resize-none outline-none leading-relaxed disabled:opacity-60"
        />

        {/* Bottom action bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-700/50">
          <span className={`text-xs ${tooLong ? "text-red-400" : "text-slate-500"}`}>
            {charCount}/1000
            {tooLong && " — too long"}
          </span>

          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <button
                onClick={() => onChange("")}
                disabled={loading}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
              >
                Clear
              </button>
            )}
            <button
              id="analyze-intent-button"
              onClick={onSubmit}
              disabled={loading || !isValid}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Find My Products
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-xs text-slate-500 pl-1">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600 text-slate-300 font-mono text-xs">Enter</kbd> to submit,{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600 text-slate-300 font-mono text-xs">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
