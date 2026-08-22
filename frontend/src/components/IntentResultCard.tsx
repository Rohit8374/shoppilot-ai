// ShopPilot AI — Intent Result Card Component

import type { IntentResult } from "../types";

interface IntentResultCardProps {
  result: IntentResult;
}

function formatCurrency(currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency.toUpperCase()] ?? currency;
}

function formatBudget(result: IntentResult): string {
  const sym = formatCurrency(result.budget.currency);
  const { minimum, maximum } = result.budget;
  if (minimum && maximum) return `${sym}${minimum.toLocaleString()} – ${sym}${maximum.toLocaleString()}`;
  if (maximum) return `Up to ${sym}${maximum.toLocaleString()}`;
  if (minimum) return `From ${sym}${minimum.toLocaleString()}`;
  return "Not specified";
}

function TagList({ items, color }: { items: string[]; color: string }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500 italic">None specified</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${color}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</h3>
      </div>
      {children}
    </div>
  );
}

export function IntentResultCard({ result }: IntentResultCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-sm overflow-hidden animate-fade-in shadow-xl shadow-black/30">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Intent Agent Output</p>
            <p className="text-sm font-semibold text-white capitalize">{result.category} Search</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
          ✓ Analyzed
        </span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Category + Budget — prominent top row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3.5 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</p>
            <p className="text-lg font-semibold text-white capitalize">{result.category}</p>
          </div>
          <div className="rounded-xl bg-indigo-950/40 border border-indigo-800/40 p-3.5 space-y-1">
            <p className="text-xs font-medium text-indigo-400/70 uppercase tracking-wider">Budget</p>
            <p className="text-lg font-semibold text-indigo-300">{formatBudget(result)}</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-700/50" />

        {/* Preferences */}
        <Section
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
          label="Preferences"
        >
          <TagList
            items={result.preferences}
            color="bg-slate-800/60 border-slate-600/60 text-slate-300"
          />
        </Section>

        {/* Must have */}
        <Section
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          label="Must Have"
        >
          <TagList
            items={result.must_have}
            color="bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
          />
        </Section>

        {/* Nice to have */}
        <Section
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          }
          label="Nice to Have"
        >
          <TagList
            items={result.nice_to_have}
            color="bg-amber-950/40 border-amber-800/40 text-amber-300"
          />
        </Section>

        {/* Original query */}
        {result.raw_query && (
          <>
            <hr className="border-slate-700/50" />
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Your Query</p>
              <p className="text-sm text-slate-400 italic">"{result.raw_query}"</p>
            </div>
          </>
        )}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-800/20">
        <p className="text-xs text-slate-500 text-center">
          Product search, ranking &amp; recommendations coming in Phase 2
        </p>
      </div>
    </div>
  );
}
