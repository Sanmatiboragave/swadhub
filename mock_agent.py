"""
A lightweight local classifier for development/testing when an API key
isn't available. Uses simple heuristics to approximate classifications so
`run_batch.py --mock` can run without network access.
"""
from typing import Dict

from prompts import CATEGORY_TO_TEAM


def classify_ticket(subject: str, body: str, **kwargs) -> Dict:
    text = f"{subject}\n\n{body}".lower()

    # Default safe values
    category = "General Inquiry"
    urgency = "Low"
    confidence = 0.5
    reasoning = "Heuristic fallback classification in mock mode."

    if any(k in text for k in ("site is", "can't log", "500", "down", "can't login", "login")):
        category = "Technical"
        urgency = "Critical"
        confidence = 0.95
        reasoning = "Reported site outage / login failures blocking users."
    elif any(k in text for k in ("charged", "refund", "charge", "billing")):
        category = "Billing"
        urgency = "High"
        confidence = 0.9
        reasoning = "User reports duplicate or incorrect charge."
    elif any(k in text for k in ("export", "csv", "totals", "report")):
        category = "Bug Report"
        urgency = "High"
        confidence = 0.85
        reasoning = "Exported data mismatch vs dashboard totals indicates a bug."
    elif "password" in text or "reset" in text:
        category = "Account"
        urgency = "High"
        confidence = 0.9
        reasoning = "User cannot access account; reset email not received."
    elif "urgent" in text and "button" in text:
        category = "General Inquiry"
        urgency = "Low"
        confidence = 0.2
        reasoning = "User claims urgency but describes a cosmetic issue; low confidence."
    elif "security" in text or "leak" in text or "sensitive" in text:
        category = "Bug Report"
        urgency = "Critical"
        confidence = 0.4
        reasoning = "Possible data exposure reported; flagging for human review."
    elif "dark mode" in text or "feature request" in text:
        category = "General Inquiry"
        urgency = "Low"
        confidence = 0.8
        reasoning = "Feature request / enhancement."
    elif "thanks" in text or "great" in text:
        category = "General Inquiry"
        urgency = "Low"
        confidence = 0.99
        reasoning = "Positive feedback, no action required."

    needs_human_review = confidence < 0.6
    routed_team = CATEGORY_TO_TEAM.get(category, "Support (L1)")

    return {
        "category": category,
        "urgency": urgency,
        "confidence": confidence,
        "reasoning": reasoning,
        "needs_human_review": needs_human_review,
        "routed_team": routed_team,
        "subject": subject,
    }
