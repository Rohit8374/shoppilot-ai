"""
ShopPilot AI — Razorpay Payment Service
Handles Razorpay test-mode order creation and payment verification.
"""

import razorpay

from app.config import get_settings


class PaymentService:
    """Service wrapper around the Razorpay SDK."""

    def __init__(self) -> None:
        settings = get_settings()

        if not settings.razorpay_key_id or not settings.razorpay_key_secret:
            raise ValueError("Razorpay credentials are not configured.")

        self.client = razorpay.Client(
            auth=(
                settings.razorpay_key_id,
                settings.razorpay_key_secret,
            )
        )

    def create_order(self, amount_inr: float, receipt: str) -> dict:
        """Create a Razorpay order. Amount is converted from INR to paise."""

        if amount_inr <= 0:
            raise ValueError("Amount must be greater than zero.")

        amount_paise = int(round(amount_inr * 100))

        order = self.client.order.create(
            data={
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt,
            }
        )

        return order

    def verify_payment(
        self,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool:
        """Verify the Razorpay payment signature."""

        self.client.utility.verify_payment_signature(
            {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            }
        )

        return True