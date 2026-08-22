// ShopPilot AI — API Service
// All backend calls go through this module. Base URL is read from env vars.

import type { IntentRequest, IntentResult, HealthResponse, RecommendResponse } from "../types";


const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000";

class ApiServiceError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiServiceError";
    this.statusCode = statusCode;
  }
}


async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new ApiServiceError(
      "Cannot reach the ShopPilot AI server. Make sure the backend is running on " + BASE_URL
    );
  }

  if (!response.ok) {
    let detail = `Server error ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiServiceError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  /** Check if the backend is healthy */
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/api/health");
  },

  /** Analyze a natural-language shopping query */
  analyzeIntent(query: string): Promise<IntentResult> {
    const body: IntentRequest = { query };
    return request<IntentResult>("/api/analyze-intent", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** Analyze query and get recommended products */
  recommend(query: string): Promise<RecommendResponse> {
    const body: IntentRequest = { query };
    return request<RecommendResponse>("/api/recommend", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};



export { ApiServiceError };
