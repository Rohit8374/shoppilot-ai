import { useState } from "react";

import { api } from "../services/api";
import type { RecommendationItem } from "../types";

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
    };
  }
}

interface ProductRecommendationCardProps {
  recommendations: RecommendationItem[];
  demoNote?: string;
}

export function ProductRecommendationCard({
  recommendations,
  demoNote,
}: ProductRecommendationCardProps) {
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [completedProductId, setCompletedProductId] = useState<string | null>(null);

  const handleBuyNow = async (product: RecommendationItem["product"]) => {
    setLoadingProductId(product.id);
    setPaymentError(null);
    setCheckoutMessage(null);
    setCompletedProductId(null);

    try {
      const order = await api.createOrder(product.id, product.price_inr);

      if (!window.Razorpay) {
        throw new Error("Payment checkout is unavailable. Please refresh and try again.");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ShopPilot AI",
        description: order.product.name,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            const verification = await api.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );

            if (!verification.verified) {
              throw new Error("Payment verification failed");
            }

            setLoadingProductId(null);
            setCompletedProductId(product.id);
          } catch {
            setLoadingProductId(null);
            setPaymentError("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingProductId(null);
            setCheckoutMessage("Checkout was closed before payment was verified.");
          },
        },
      });

      checkout.open();
    } catch (error) {
      setLoadingProductId(null);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again."
      );
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center space-y-2">
        <p className="text-base font-semibold text-slate-300">No matching demo products found</p>
        <p className="text-xs text-slate-400">
          Try broadening your search query or adjusting your maximum budget.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          Recommended Products ({recommendations.length})
        </h2>
        {demoNote && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 font-medium">
            Demo Data Only
          </span>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((item, index) => {
          const { product, match_score, reasons } = item;
          const formattedPrice = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(product.price_inr);

          return (
            <div
              key={product.id || index}
              className="group relative rounded-xl border border-slate-700/60 bg-slate-900/80 p-5 space-y-4 shadow-lg hover:border-indigo-500/50 transition-all duration-200"
            >
              {/* Top row: Brand + Name + Score badge */}
              <div className="flex flex-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                    {product.brand}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {product.name}
                  </h3>
                </div>

                {/* Score badge */}
                <div className="flex flex-col items-end shrink-0">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      match_score >= 85
                        ? "bg-emerald-950 border border-emerald-700/60 text-emerald-300"
                        : match_score >= 70
                        ? "bg-indigo-950 border border-indigo-700/60 text-indigo-300"
                        : "bg-slate-800 border border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{match_score}% Match</span>
                  </div>
                  <span className="text-xl font-extrabold text-white mt-2">
                    {formattedPrice}
                  </span>
                </div>
              </div>

              {/* Reasons list */}
              {reasons.length > 0 && (
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 space-y-1.5">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    Why it matches:
                  </p>
                  <ul className="space-y-1">
                    {reasons.map((reason, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Specs grid */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Key Specifications
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(product.specs)
                      .slice(0, 6)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-md bg-slate-800/50 p-2 text-xs border border-slate-700/30"
                        >
                          <span className="text-slate-400 capitalize block text-[10px]">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-slate-200 font-medium truncate block">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

            {/* Buy Now */}
              <button
                type="button"
                onClick={() => void handleBuyNow(product)}
                disabled={loadingProductId !== null}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingProductId === product.id ? "Opening Checkout..." : "Buy Now"}
              </button>

              {paymentError && loadingProductId === null && (
                <p role="alert" className="text-xs text-rose-400">
                  {paymentError}
                </p>
              )}

              {checkoutMessage && loadingProductId === null && !paymentError && (
                <p className="text-xs text-amber-400">{checkoutMessage}</p>
              )}

              {completedProductId === product.id && (
                <p className="text-xs text-emerald-400">Payment verified successfully</p>
              )}

              {/* Demo note footer per card */}
              <p className="text-[10px] text-slate-500 italic">
                * {product.demo_note || "Sample data only — prices are not live market prices"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
