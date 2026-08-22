"""
ShopPilot AI — Product Matching & Ranking Service
Loads catalog from data/products.json and deterministically ranks products against user intent.
"""

import json
import logging
from pathlib import Path
from typing import Optional, Any

from app.models.intent import IntentResult
from app.models.product import Product, RecommendationItem, RecommendResponse

logger = logging.getLogger(__name__)

# Category aliases mapping
CATEGORY_ALIASES: dict[str, list[str]] = {
    "smartphone": ["smartphone", "phone", "mobile", "cellphone", "android", "iphone"],
    "laptop": ["laptop", "notebook", "macbook", "computer", "pc"],
    "headphones": ["headphones", "headphone", "earphones", "earbuds", "headset", "audio"],
    "smartwatch": ["smartwatch", "watch", "wearable", "fitness band"],
}


def _get_data_path() -> Path:
    """Find data/products.json by walking up from current file."""
    current = Path(__file__).resolve().parent
    for _ in range(4):
        candidate = current / "data" / "products.json"
        if candidate.exists():
            return candidate
        # Also check root level data/ directory when running inside backend/
        candidate_root = current.parent / "data" / "products.json"
        if candidate_root.exists():
            return candidate_root
        current = current.parent
    
    # Direct fallback relative to working directory
    return Path("data/products.json").resolve()


class ProductService:
    """
    Deterministic product search, filtering, and ranking service.
    Phase 2 of ShopPilot AI architecture.
    """

    def __init__(self, catalog_path: Optional[Path] = None) -> None:
        self._catalog_path = catalog_path or _get_data_path()
        self._products: list[Product] = []
        self._load_catalog()

    def _load_catalog(self) -> None:
        """Load product data from JSON file into Product model instances."""
        try:
            if not self._catalog_path.exists():
                logger.error(f"Catalog file not found at {self._catalog_path}")
                self._products = []
                return

            with open(self._catalog_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            raw_products = data.get("products", [])
            self._products = [Product(**p) for p in raw_products]
            logger.info(f"Loaded {len(self._products)} products from {self._catalog_path.name}")
        except Exception as e:
            logger.error(f"Failed to load product catalog: {e}")
            self._products = []

    def get_all_products(self) -> list[Product]:
        """Return all catalog products."""
        return self._products

    def get_product(self, product_id: str) -> Optional[Product]:
        """Return a product by ID."""
        return next(
            (product for product in self._products if product.id == product_id),
            None,
        )

    def recommend(self, intent: IntentResult, top_k: int = 5) -> RecommendResponse:
        """
        Filter, score, and rank catalog products matching user intent.

        Args:
            intent: Extracted IntentResult from IntentAgent.
            top_k: Max number of recommendations to return.

        Returns:
            RecommendResponse containing intent, total matches found, and ranked items.
        """
        category_intent = intent.category.strip().lower()
        max_budget = intent.budget.maximum

        # 1. Normalize Category
        matched_category = self._normalize_category(category_intent)

        # 2. Filter Candidates
        candidates = self._filter_candidates(matched_category, max_budget)
        total_found = len(candidates)

        if not candidates:
            # Fallback check: if no category match or budget underflow, search broader if safe
            logger.info(f"No candidates found for category='{matched_category}', max_budget={max_budget}")
            return RecommendResponse(
                query=intent.raw_query or "",
                intent=intent,
                recommendations=[],
                total_found=0,
                demo_note="No matching demo products found under your criteria.",
            )

        # 3. Score & Rank Candidates
        scored_items: list[RecommendationItem] = []
        for product in candidates:
            item = self._score_product(product, intent, matched_category)
            scored_items.append(item)

        # Sort by match_score descending
        scored_items.sort(key=lambda x: x.match_score, reverse=True)
        top_recommendations = scored_items[:top_k]

        return RecommendResponse(
            query=intent.raw_query or "",
            intent=intent,
            recommendations=top_recommendations,
            total_found=total_found,
            demo_note="Product data is sample/demo only — prices are not live market prices",
        )

    def _normalize_category(self, intent_cat: str) -> str:
        """Map intent category strings to standard catalog categories."""
        intent_cat = intent_cat.lower()
        for cat, aliases in CATEGORY_ALIASES.items():
            if intent_cat == cat or intent_cat in aliases:
                return cat
            for alias in aliases:
                if alias in intent_cat or intent_cat in alias:
                    return cat
        return intent_cat

    def _filter_candidates(self, category: str, max_budget: Optional[float]) -> list[Product]:
        """
        Filter product list by category and strict maximum budget rule.
        BUDGET RULE: Products over maximum budget are excluded if max_budget is provided.
        """
        candidates: list[Product] = []

        for product in self._products:
            prod_cat = product.category.lower()
            
            # Category match check
            category_match = (
                prod_cat == category
                or category in prod_cat
                or prod_cat in category
                or any(alias in prod_cat for alias in CATEGORY_ALIASES.get(category, []))
            )

            if not category_match and category not in ["unknown", "any", "all"]:
                continue

            # Budget rule check
            if max_budget is not None and max_budget > 0:
                if product.price_inr > max_budget:
                    continue

            candidates.append(product)

        # Fallback if no exact category matches but budget applies (e.g. unknown category)
        if not candidates and category in ["unknown", "any", "all"]:
            for product in self._products:
                if max_budget is None or product.price_inr <= max_budget:
                    candidates.append(product)

        return candidates

    def _score_product(self, product: Product, intent: IntentResult, category: str) -> RecommendationItem:
        """
        Compute a transparent score (0-100) and human-readable reasons for a product.
        """
        score = 40  # Base starting score for passing category & budget filters
        reasons: list[str] = []

        max_budget = intent.budget.maximum
        price = product.price_inr

        # 1. Budget Reasons & Score Boost
        if max_budget is not None and max_budget > 0:
            savings = max_budget - price
            savings_pct = (savings / max_budget) * 100
            reasons.append(f"Within your ₹{max_budget:,.0f} budget (priced at ₹{price:,.0f})")
            
            # Bonus points for great value within budget
            if savings_pct >= 0:
                score += 15
            if 0 <= savings_pct <= 30:  # Efficiently using budget without over-saving
                score += 5
        else:
            reasons.append(f"Priced competitively at ₹{price:,.0f}")
            score += 10

        # Build searchable string from product metadata
        product_text = f"{product.name} {product.brand} {' '.join(product.tags)} ".lower()
        for k, v in product.specs.items():
            product_text += f"{k} {v} ".lower()

        # Combine terms to evaluate
        search_terms: list[str] = []
        for pref in intent.preferences:
            search_terms.append(pref.lower())
        for must in intent.must_have:
            search_terms.append(must.lower())
        for nice in intent.nice_to_have:
            search_terms.append(nice.lower())

        matched_terms: set[str] = set()

        # Check key domain terms
        domain_keywords = [
            ("gaming", "Strong gaming performance"),
            ("camera", "Good camera setup"),
            ("processor", "Powerful processor"),
            ("ram", "Sufficient RAM capacity"),
            ("storage", "Ample storage space"),
            ("battery", "Long-lasting battery"),
            ("display", "High quality display"),
            ("amoled", "AMOLED display technology"),
            ("5g", "5G connectivity support"),
            ("anc", "Active Noise Cancellation (ANC)"),
            ("noise cancellation", "Noise cancellation enabled"),
            ("ai", "AI-optimized performance"),
            ("lightweight", "Portable & lightweight design"),
        ]

        for kw, reason_desc in domain_keywords:
            if any(kw in term for term in search_terms) or (intent.raw_query and kw in intent.raw_query.lower()):
                if kw in product_text or (kw == "5g" and product.specs.get("5g")) or (kw in ["anc", "noise cancellation"] and product.specs.get("anc")):
                    score += 12
                    matched_terms.add(kw)
                    if reason_desc not in reasons:
                        reasons.append(reason_desc)

        # Check generic search terms against product tags / specs
        for term in search_terms:
            clean_term = term.strip()
            if not clean_term or clean_term in matched_terms:
                continue
            
            # Sub-word token matching
            words = [w for w in clean_term.split() if len(w) > 2]
            for word in words:
                if word in product_text and word not in matched_terms:
                    score += 8
                    matched_terms.add(word)
                    reason_msg = f"Matches requirement: '{clean_term}'"
                    if reason_msg not in reasons and len(reasons) < 5:
                        reasons.append(reason_msg)
                    break

        # Brand check if mentioned
        if intent.raw_query and product.brand.lower() in intent.raw_query.lower():
            score += 10
            reasons.append(f"Preferred brand ({product.brand})")

        # Clamp score between 0 and 100
        final_score = min(max(int(score), 10), 100)

        return RecommendationItem(
            product=product,
            match_score=final_score,
            reasons=reasons,
        )
