// ShopPilot AI — TypeScript type definitions
// Mirrors the backend Pydantic models exactly

export interface Budget {
  currency: string;
  minimum: number | null;
  maximum: number | null;
}

export interface IntentResult {
  category: string;
  budget: Budget;
  preferences: string[];
  must_have: string[];
  nice_to_have: string[];
  raw_query: string | null;
}

export interface IntentRequest {
  query: string;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

export interface ApiError {
  detail: string;
  code?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price_inr: number;
  specs: Record<string, any>;
  tags: string[];
  demo_note: string;
}

export interface RecommendationItem {
  product: Product;
  match_score: number;
  reasons: string[];
}

export interface RecommendResponse {
  query: string;
  intent: IntentResult;
  recommendations: RecommendationItem[];
  total_found: number;
  demo_note: string;
}

export type LoadingState = "idle" | "loading" | "success" | "error";
export interface CreateOrderRequest {
  product_id: string;
  amount_inr: number;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  product: {
    id: string;
    name: string;
    price_inr: number;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  message: string;
}

