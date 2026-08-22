"""
ShopPilot AI — Application Configuration
Reads settings from environment variables (via .env file).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All sensitive values must be set via .env — never hardcode them.
    """

    # LLM Configuration
    llm_provider: str = "gemini"
    llm_model: str = "gemini-2.0-flash"
    llm_api_key: str = ""

    # Supabase (placeholder for Phase 2+)
    supabase_url: str = ""
    supabase_anon_key: str = ""
        # Razorpay Configuration
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    # CORS origins — comma-separated string in .env, parsed as list
    cors_origins: str = "http://localhost:5173"

    # App metadata
    app_name: str = "ShopPilot AI"
    app_version: str = "0.1.0"
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list of origin URLs."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance (singleton pattern)."""
    return Settings()
