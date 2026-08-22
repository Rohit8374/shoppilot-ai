// ShopPilot AI — Home Page

import { useState, useEffect, useCallback } from "react";
import { Header } from "../components/Header";
import { SearchInput } from "../components/SearchInput";
import { ExamplePrompts } from "../components/ExamplePrompts";
import { IntentResultCard } from "../components/IntentResultCard";
import { ProductRecommendationCard } from "../components/ProductRecommendationCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { api, ApiServiceError } from "../services/api";
import type { RecommendResponse, LoadingState } from "../types";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [recommendData, setRecommendData] = useState<RecommendResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [apiStatus, setApiStatus] = useState<"unknown" | "ok" | "error">("unknown");

  // Check API health on mount
  useEffect(() => {
    api
      .health()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || loadingState === "loading") return;

    setLoadingState("loading");
    setRecommendData(null);
    setErrorMessage("");

    try {
      const data = await api.recommend(query.trim());
      setRecommendData(data);
      setLoadingState("success");
    } catch (err) {
      const message =
        err instanceof ApiServiceError
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(message);
      setLoadingState("error");
    }
  }, [query, loadingState]);

  const handleRetry = () => {
    setLoadingState("idle");
    setErrorMessage("");
  };

  const handleExampleSelect = (prompt: string) => {
    setQuery(prompt);
    setRecommendData(null);
    setErrorMessage("");
    setLoadingState("idle");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header apiStatus={apiStatus} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Hero section */}
        <div className="text-center space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Agentic Commerce Assistant · Phase 2 (Search & Ranking)
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Find the perfect product
            <br />
            <span className="text-indigo-400">with AI precision</span>
          </h1>

          {/* Sub-heading */}
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Tell ShopPilot AI what you need in plain English. Our multi-agent engine will analyze your
            requirements and recommend matching products instantly.
          </p>
        </div>

        {/* Search card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 sm:p-6 space-y-4 shadow-xl shadow-black/20">
          <div className="space-y-1">
            <label htmlFor="shopping-query" className="text-sm font-semibold text-slate-200">
              What are you looking for?
            </label>
            <p className="text-xs text-slate-500">
              Include your category, budget, and any specific requirements
            </p>
          </div>

          <SearchInput
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            loading={loadingState === "loading"}
          />

          <ExamplePrompts
            onSelect={handleExampleSelect}
            disabled={loadingState === "loading"}
          />
        </div>

        {/* Results area */}
        {loadingState === "loading" && <LoadingSpinner />}

        {loadingState === "error" && (
          <ErrorMessage message={errorMessage} onRetry={handleRetry} />
        )}

        {loadingState === "success" && recommendData && (
          <div className="space-y-8">
            {/* Intent extraction breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-300">Detected Requirements</h2>
                <div className="flex-1 h-px bg-slate-700/60" />
              </div>
              <IntentResultCard result={recommendData.intent} />
            </div>

            {/* Product recommendations */}
            <ProductRecommendationCard
              recommendations={recommendData.recommendations}
              demoNote={recommendData.demo_note}
            />
          </div>
        )}

        {/* Feature pipeline */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider text-center">
            Agent Pipeline
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { name: "Intent", status: "active", desc: "Understands query" },
              { name: "Search", status: "active", desc: "Filters catalog" },
              { name: "Rank", status: "active", desc: "Scores relevance" },
              { name: "Budget", status: "active", desc: "Validates budget" },
              { name: "Checkout", status: "planned", desc: "Razorpay (Phase 3)" },
            ].map((agent, i) => (
              <div
                key={agent.name}
                className={`relative rounded-xl border p-3 text-center space-y-1 ${
                  agent.status === "active"
                    ? "border-indigo-700/60 bg-indigo-950/40"
                    : "border-slate-700/40 bg-slate-900/30 opacity-50"
                }`}
              >
                {/* Step number */}
                <div
                  className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                    agent.status === "active"
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                <p
                  className={`text-xs font-semibold ${
                    agent.status === "active" ? "text-indigo-300" : "text-slate-400"
                  }`}
                >
                  {agent.name}
                </p>
                <p className="text-xs text-slate-500 hidden sm:block">{agent.desc}</p>
                {agent.status === "active" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-12">
        <p className="text-center text-xs text-slate-600">
          ShopPilot AI · Phase 2 Search & Ranking · Demo data only — prices are not live market prices
        </p>
      </footer>
    </div>
  );
}
