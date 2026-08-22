"""
ShopPilot AI — LLM Service Abstraction
Provides a clean interface for calling any LLM provider.
Swap providers by changing LLM_PROVIDER in .env — no code changes needed.
"""

import logging
from abc import ABC, abstractmethod
from typing import Optional

import google.generativeai as genai

from app.config import get_settings

logger = logging.getLogger(__name__)


class LLMService(ABC):
    """Abstract base class for all LLM provider implementations."""

    @abstractmethod
    async def complete(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Send a prompt to the LLM and return the text response.

        Args:
            prompt: The user/task prompt.
            system_prompt: Optional system-level instructions.

        Returns:
            The raw text response from the model.

        Raises:
            LLMServiceError: If the API call fails.
        """
        ...


class LLMServiceError(Exception):
    """Raised when an LLM API call fails."""
    pass


class GeminiService(LLMService):
    """Google Gemini implementation of LLMService."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash") -> None:
        if not api_key:
            raise LLMServiceError(
                "LLM_API_KEY is not set. Please configure it in your .env file."
            )
        genai.configure(api_key=api_key)
        self._model_name = model
        self._model = genai.GenerativeModel(model)
        logger.info(f"GeminiService initialized with model: {model}")

    async def complete(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Call the Gemini API and return the text response."""
        try:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"

            logger.debug(f"Sending prompt to Gemini ({self._model_name})")
            response = self._model.generate_content(full_prompt)
            result = response.text
            logger.debug(f"Gemini response received ({len(result)} chars)")
            return result

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise LLMServiceError(f"Gemini API call failed: {str(e)}") from e


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_llm_service() -> LLMService:
    """
    Factory function — returns the correct LLM service based on LLM_PROVIDER env var.
    Add new providers here without touching any other code.
    """
    settings = get_settings()
    provider = settings.llm_provider.lower()

    if provider == "gemini":
        return GeminiService(api_key=settings.llm_api_key, model=settings.llm_model)

    # Future providers — uncomment and implement when needed:
    # elif provider == "openai":
    #     from app.services.openai_service import OpenAIService
    #     return OpenAIService(api_key=settings.llm_api_key, model=settings.llm_model)
    # elif provider == "anthropic":
    #     from app.services.anthropic_service import AnthropicService
    #     return AnthropicService(api_key=settings.llm_api_key, model=settings.llm_model)

    raise ValueError(
        f"Unsupported LLM provider: '{provider}'. "
        "Set LLM_PROVIDER to 'gemini' in your .env file."
    )
