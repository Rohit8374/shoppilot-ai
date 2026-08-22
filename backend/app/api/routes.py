"""
ShopPilot AI — API Routes
Defines all REST API endpoints for Phase 1.
"""
import uuid

from app.models.product import CreateOrderRequest, VerifyPaymentRequest
from app.services.payment_service import PaymentService
import logging
from functools import lru_cache

from fastapi import APIRouter, HTTPException, status

from app.agents.intent_agent import IntentAgent, IntentAgentError
from app.config import get_settings
from app.models.intent import IntentRequest, IntentResult, ErrorResponse
from app.models.product import RecommendResponse
from app.services.llm_service import get_llm_service, LLMServiceError
from app.services.product_service import ProductService

logger = logging.getLogger(__name__)
router = APIRouter()


@lru_cache()
def _get_intent_agent() -> IntentAgent:
    """Create and cache the IntentAgent (singleton per process)."""
    llm = get_llm_service()
    return IntentAgent(llm_service=llm)


@lru_cache()
def _get_product_service() -> ProductService:
    """Create and cache the ProductService (singleton per process)."""
    return ProductService()


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@router.get(
    "/health",
    summary="Health Check",
    tags=["system"],
    responses={200: {"description": "Service is healthy"}},
)
async def health_check() -> dict:
    """
    Returns the current health status of the ShopPilot AI API.
    Use this to verify the service is running before making other requests.
    """
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
    }


# ---------------------------------------------------------------------------
# Intent Analysis
# ---------------------------------------------------------------------------

@router.post(
    "/analyze-intent",
    response_model=IntentResult,
    summary="Analyze Shopping Intent",
    tags=["agents"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Successfully extracted structured intent"},
        400: {"description": "Invalid request — query too short or malformed"},
        422: {"description": "Validation error"},
        500: {"description": "Internal error — LLM call or parsing failed"},
        503: {"description": "LLM service unavailable"},
    },
)
async def analyze_intent(request: IntentRequest) -> IntentResult:
    """
    **Intent Agent** — Convert a natural-language shopping query into structured intent.

    Accepts a free-form shopping requirement and returns:
    - Product category
    - Budget constraints (currency + min/max)
    - Preferences (general desires)
    - Must-have requirements
    - Nice-to-have features

    This is the first step in the ShopPilot AI multi-agent pipeline.
    """
    logger.info(f"POST /api/analyze-intent — query length={len(request.query)}")

    try:
        agent = _get_intent_agent()
        result = await agent.analyze(request.query)
        return result

    except LLMServiceError as e:
        logger.error(f"LLM service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service is currently unavailable: {str(e)}",
        )

    except IntentAgentError as e:
        logger.error(f"Intent agent error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

    except Exception as e:
        logger.exception(f"Unexpected error in analyze_intent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )


# ---------------------------------------------------------------------------
# Product Recommendation Pipeline
# ---------------------------------------------------------------------------

@router.post(
    "/recommend",
    response_model=RecommendResponse,
    summary="Recommend Products",
    tags=["agents"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Successfully analyzed query and retrieved recommendations"},
        400: {"description": "Invalid request — query too short or malformed"},
        500: {"description": "Internal error — LLM call or recommendation processing failed"},
        503: {"description": "LLM service unavailable"},
    },
)
async def recommend(request: IntentRequest) -> RecommendResponse:
    """
    **ShopPilot AI Full Pipeline** — Analyze natural language shopping query and return ranked product recommendations.

    1. Executes Intent Agent to parse shopping criteria (category, budget, specs).
    2. Runs Product Service to filter candidate products by budget and score relevance.
    3. Returns top recommended products with match scores (0-100) and rationale.
    """
    logger.info(f"POST /api/recommend — query length={len(request.query)}")

    try:
        agent = _get_intent_agent()
        intent = await agent.analyze(request.query)

        product_service = _get_product_service()
        response = product_service.recommend(intent)
        return response

    except LLMServiceError as e:
        logger.error(f"LLM service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service is currently unavailable: {str(e)}",
        )

    except IntentAgentError as e:
        logger.error(f"Intent agent error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

    except Exception as e:
        logger.exception(f"Unexpected error in recommend: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating recommendations.",
        )

@router.post("/orders")
async def create_payment_order(request: CreateOrderRequest):
    """Create a Razorpay order for a valid demo product."""

    product = _get_product_service().get_product(request.product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")

    actual_price = product.price_inr

    # Never trust the amount supplied by the frontend.
    if abs(request.amount_inr - actual_price) > 0.01:
        raise HTTPException(
            status_code=400,
            detail="Product price does not match the catalog price.",
        )

    receipt = f"sp_{uuid.uuid4().hex[:16]}"

    try:
        payment_service = PaymentService()
        order = payment_service.create_order(
            amount_inr=actual_price,
            receipt=receipt,
        )

        settings = get_settings()

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": settings.razorpay_key_id,
            "product": product.model_dump(),
        }

    except Exception:
        logger.exception("Failed to create Razorpay order")
        raise HTTPException(
            status_code=502,
            detail="Unable to create payment order.",
        )


@router.post("/payments/verify")
async def verify_payment(request: VerifyPaymentRequest):
    """Verify a completed Razorpay payment."""

    try:
        payment_service = PaymentService()

        payment_service.verify_payment(
            order_id=request.razorpay_order_id,
            payment_id=request.razorpay_payment_id,
            signature=request.razorpay_signature,
        )

        return {
            "verified": True,
            "message": "Payment verified successfully.",
        }

    except Exception:
        logger.exception("Razorpay payment verification failed")

        raise HTTPException(
            status_code=400,
            detail="Payment verification failed.",
        )