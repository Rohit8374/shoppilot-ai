"""
ShopPilot AI — Intent Agent
Converts a natural-language shopping query into structured intent JSON.
"""

import json
import logging
import re
from typing import Optional

from app.models.intent import IntentResult, Budget
from app.services.llm_service import LLMService, LLMServiceError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Intent Agent for ShopPilot AI, an e-commerce assistant.
Your job is to analyze a user's natural-language shopping request and extract structured intent.

You MUST respond with ONLY valid JSON — no markdown, no explanation, no code fences.
The JSON must match this exact schema:

{
  "category": "string (e.g. smartphone, laptop, headphones, tablet, smartwatch)",
  "budget": {
    "currency": "string (e.g. INR, USD, EUR)",
    "minimum": number or null,
    "maximum": number or null
  },
  "preferences": ["list of general preference strings"],
  "must_have": ["list of hard requirements"],
  "nice_to_have": ["list of optional desired features"]
}

Rules:
- category must be a single lowercase product category word
- If no currency is mentioned, assume INR
- Extract numeric budget values only (no currency symbols in numbers)
- preferences: general desires like "gaming", "lightweight", "good battery"
- must_have: explicit hard requirements like "at least 16GB RAM", "5G support"
- nice_to_have: soft preferences like "would prefer AMOLED display"
- If a field has no value, use an empty list or null
- ONLY respond with the JSON object — nothing else
"""


class IntentAgent:
    """
    Intent Agent — Phase 1 of the ShopPilot AI multi-agent pipeline.
    Parses natural-language shopping queries into structured Pydantic models.
    """

    def __init__(self, llm_service: LLMService) -> None:
        self._llm = llm_service
        logger.info("IntentAgent initialized")

    async def analyze(self, query: str) -> IntentResult:
        """
        Analyze a shopping query and return a structured IntentResult.

        Args:
            query: The user's natural-language shopping request.

        Returns:
            IntentResult: Validated structured intent.

        Raises:
            IntentAgentError: If the LLM fails or returns unparseable output.
        """
        logger.info(f"IntentAgent analyzing query: {query[:100]}...")

        prompt = f"Shopping query: {query}"

        try:
            raw_response = await self._llm.complete(prompt, system_prompt=SYSTEM_PROMPT)
        except LLMServiceError as e:
            raise IntentAgentError(f"LLM call failed: {str(e)}") from e

        result = self._parse_response(raw_response, query)
        logger.info(f"IntentAgent extracted category='{result.category}', budget={result.budget}")
        return result

    def _parse_response(self, raw: str, original_query: str) -> IntentResult:
        """
        Parse and validate the LLM's JSON response into an IntentResult.
        Handles common LLM output issues like wrapping markdown fences.
        """
        # Strip markdown code fences if present (e.g. ```json ... ```)
        cleaned = raw.strip()
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}\nRaw: {raw[:500]}")
            raise IntentAgentError(
                f"The AI returned an unparseable response. Please try rephrasing your query."
            ) from e

        try:
            # Build Budget sub-model
            budget_data = data.get("budget", {})
            budget = Budget(
                currency=budget_data.get("currency", "INR"),
                minimum=budget_data.get("minimum"),
                maximum=budget_data.get("maximum"),
            )

            result = IntentResult(
                category=str(data.get("category", "unknown")).lower(),
                budget=budget,
                preferences=list(data.get("preferences", [])),
                must_have=list(data.get("must_have", [])),
                nice_to_have=list(data.get("nice_to_have", [])),
                raw_query=original_query,
            )
        except Exception as e:
            logger.error(f"Pydantic validation failed: {e}\nData: {data}")
            raise IntentAgentError(
                f"AI response did not match expected structure: {str(e)}"
            ) from e

        return result


class IntentAgentError(Exception):
    """Raised when the Intent Agent fails to produce a valid result."""
    pass
