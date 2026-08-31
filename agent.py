"""
Support Ticket Triage Agent - core logic.

classify_ticket() is the single entry point: give it a subject + body,
get back a structured routing decision.
"""

import json
import os
import re
import sys
import time

from anthropic import Anthropic

from prompts import (
    SYSTEM_PROMPT,
    build_user_prompt,
    CATEGORIES,
    URGENCY_LEVELS,
    CATEGORY_TO_TEAM,
    CONFIDENCE_THRESHOLD,
)

MODEL = "claude-sonnet-4-6"

_client = None


def get_client() -> Anthropic:
    """Lazily create the Anthropic client so importing this module doesn't
    require an API key to already be set (useful for tests)."""
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Export it before running, e.g.\n"
                "  export ANTHROPIC_API_KEY=sk-ant-...\n"
            )
        _client = Anthropic(api_key=api_key)
    return _client


def _extract_json(text: str) -> dict:
    """Models sometimes wrap JSON in markdown fences despite instructions.
    Strip those defensively before parsing."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    return json.loads(cleaned)


def _validate(result: dict) -> dict:
    """Guard against the model returning a category/urgency outside the
    allowed set, or a malformed confidence value. Fail safe -> human review."""
    category = result.get("category")
    urgency = result.get("urgency")
    confidence = result.get("confidence")

    if category not in CATEGORIES:
        result["category"] = "General Inquiry"
        result["needs_human_review"] = True

    if urgency not in URGENCY_LEVELS:
        result["urgency"] = "Medium"
        result["needs_human_review"] = True

    try:
        confidence = float(confidence)
        assert 0.0 <= confidence <= 1.0
    except (TypeError, ValueError, AssertionError):
        confidence = 0.0
    result["confidence"] = confidence

    return result


def classify_ticket(subject: str, body: str, retries: int = 2) -> dict:
    """
    Classify a single support ticket.

    Returns a dict:
        {
          "subject": str,
          "category": str,
          "urgency": str,
          "confidence": float,
          "reasoning": str,
          "routed_team": str,
          "needs_human_review": bool,
        }
    """
    client = get_client()
    user_prompt = build_user_prompt(subject, body)

    last_error = None
    for attempt in range(retries + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=400,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )
            raw_text = "".join(
                block.text for block in response.content if block.type == "text"
            )
            result = _extract_json(raw_text)
            break
        except (json.JSONDecodeError, Exception) as e:  # noqa: BLE001
            last_error = e
            time.sleep(1)
    else:
        # All retries failed -> return a safe fallback instead of crashing
        # the batch run. This ticket gets flagged for a human.
        result = {
            "category": "General Inquiry",
            "urgency": "Medium",
            "confidence": 0.0,
            "reasoning": f"Agent failed to classify after {retries + 1} attempts: {last_error}",
        }

    result = _validate(result)
    result["needs_human_review"] = result.get("needs_human_review", False) or (
        result["confidence"] < CONFIDENCE_THRESHOLD
    )
    result["routed_team"] = CATEGORY_TO_TEAM.get(result["category"], "Support (L1)")
    result["subject"] = subject

    return result
