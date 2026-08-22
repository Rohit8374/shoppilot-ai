"""
ShopPilot AI — Intent Models
Pydantic models for the Intent Agent request and response.
"""

from pydantic import BaseModel, Field
from typing import Optional


class IntentRequest(BaseModel):
    """Request body for the /api/analyze-intent endpoint."""

    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Natural-language shopping requirement from the user.",
        examples=["I need a gaming phone under ₹25000 with good camera"],
    )


class Budget(BaseModel):
    """Extracted budget constraint from the user's query."""

    currency: str = Field(default="INR", description="Currency code (e.g. INR, USD)")
    minimum: Optional[float] = Field(default=None, description="Minimum budget (if specified)")
    maximum: Optional[float] = Field(default=None, description="Maximum budget")


class IntentResult(BaseModel):
    """
    Structured intent extracted from the user's natural-language query.
    Produced by the Intent Agent after LLM analysis.
    """

    category: str = Field(
        description="Primary product category (e.g. 'smartphone', 'laptop', 'headphones')"
    )
    budget: Budget = Field(description="Extracted budget constraints")
    preferences: list[str] = Field(
        default_factory=list,
        description="General preferences mentioned (e.g. 'gaming', 'lightweight')",
    )
    must_have: list[str] = Field(
        default_factory=list,
        description="Hard requirements the product must satisfy",
    )
    nice_to_have: list[str] = Field(
        default_factory=list,
        description="Optional but desired features",
    )
    raw_query: Optional[str] = Field(
        default=None,
        description="The original query string for reference",
    )


class ErrorResponse(BaseModel):
    """Standard error response shape."""

    detail: str
    code: Optional[str] = None
