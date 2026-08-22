"""
ShopPilot AI — Product Models (Phase 2)
Pydantic models for the product catalog and recommendation results.
"""

from pydantic import BaseModel, Field
from typing import Optional, Any


# ---------------------------------------------------------------------------
# Raw Product (mirrors data/products.json)
# ---------------------------------------------------------------------------

class ProductSpecs(BaseModel):
    """Flexible spec dict — accommodates smartphones, laptops, headphones etc."""

    model_config = {"extra": "allow"}

    # Common optional fields
    display: Optional[str] = None
    processor: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    battery: Optional[str] = None
    camera: Optional[str] = None
    os: Optional[str] = None
    weight: Optional[str] = None
    graphics: Optional[str] = None
    connectivity: Optional[str] = None
    anc: Optional[bool] = None
    type: Optional[str] = None
    foldable: Optional[bool] = None


class Product(BaseModel):
    """Represents a single product from the catalog."""

    id: str
    name: str
    category: str
    brand: str
    price_inr: float
    specs: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)
    demo_note: str = "Sample data only — price not live"


# ---------------------------------------------------------------------------
# Recommendation output
# ---------------------------------------------------------------------------

class RecommendationItem(BaseModel):
    """A product with relevance score and match explanations."""

    product: Product
    match_score: int = Field(ge=0, le=100, description="Relevance score 0–100")
    reasons: list[str] = Field(
        default_factory=list,
        description="Human-readable explanations of why this product was selected",
    )


class RecommendResponse(BaseModel):
    """Full recommendation pipeline output."""

    query: str
    intent: Any  # IntentResult
    recommendations: list[RecommendationItem] = Field(default_factory=list)
    total_found: int = Field(default=0, description="Total products matching category + budget before ranking")
    demo_note: str = "Product data is sample/demo only — prices are not live market prices"

from pydantic import BaseModel, Field


class CreateOrderRequest(BaseModel):
    product_id: str = Field(min_length=1)
    amount_inr: float = Field(gt=0)


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str