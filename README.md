# Support Ticket Triage Agent

An AI agent that reads an incoming support ticket (subject + body) and decides:
1. **What category** it belongs to
2. **How urgent** it is
3. **Which team** it should be routed to
4. **Whether a human should double-check it** (low-confidence cases are flagged instead of guessed)

Built for the Rooman Technologies 24-Hour AI Agent Challenge.

> **My agent takes** a support ticket's subject and body **and produces** a category, urgency level, confidence score, routing decision, and a flag for human review when the agent isn't confident.

---

## How it works

```
tickets.json
     │
     ▼
run_batch.py  ──►  agent.py (classify_ticket)  ──►  Claude API (with system prompt)
     │                                                      │
     │                                                      ▼
     │                                          JSON: category, urgency,
     │                                          confidence, reasoning
     │                                                      │
     ▼                                                      ▼
results/output.json  ◄────────  validate + route  ◄─────────┘
```

For each ticket, the agent:
1. Sends the subject + body to Claude with a system prompt that defines the allowed categories, urgency levels, and scoring rules.
2. Parses the model's JSON response (defensively — strips markdown fences if the model adds them).
3. Validates the output — if the model returns something outside the allowed categories/urgency levels, or a bad confidence value, the agent falls back to a safe default and flags the ticket, rather than crashing or silently trusting bad data.
4. Applies routing rules (category → team) and a confidence threshold (below **0.6** → flagged for human review).

---

## Setup

**Requirements:** Python 3.9+, an Anthropic API key.

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd ticket-triage-agent

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

---

## Running it

Run on the included sample tickets:

```bash
python run_batch.py
```

Run on your own tickets:

```bash
python run_batch.py --input data/my_tickets.json --output results/my_output.json
```

Input format (`data/sample_tickets.json`):

```json
[
  {
    "id": "T-001",
    "subject": "Site is completely down for our whole team",
    "body": "We can't log in at all since about 20 minutes ago..."
  }
]
```

Output format (`results/output.json`) — one entry per ticket:

```json
{
  "id": "T-001",
  "subject": "Site is completely down for our whole team",
  "category": "Technical",
  "urgency": "Critical",
  "confidence": 0.97,
  "reasoning": "Complete login outage returning 500 errors, blocking the entire team from working.",
  "routed_team": "Engineering",
  "needs_human_review": false
}
```

`results/sample_output.json` shows the expected output shape and reasoning quality across all 12 sample tickets (illustrative — run the batch yourself with a live key to reproduce exact numbers, since LLM outputs aren't perfectly deterministic).

---

## Sample data

`data/sample_tickets.json` contains 12 tickets deliberately mixed:
- **Clear-cut cases** (site down, duplicate billing charge, password reset)
- **Deliberately ambiguous cases** to test the confidence/review logic:
  - `T-006` — subject says "urgent!!!" but the body describes a cosmetic issue (mismatch between stated and real urgency)
  - `T-009` — a possible security/data-leak report where the user themselves isn't sure if it's real — high stakes *if* true, but genuinely uncertain, so it should be flagged rather than auto-routed

---

## Design choices

- **LLM-based classification over keyword rules.** Ticket language is too varied for regex/keyword matching to hold up (e.g. "urgent!!!" vs. an actually urgent ticket with no exclamation marks). An LLM reading intent handles this far better, at the cost of non-determinism and API latency/cost.
- **Structured JSON output, not free text.** The system prompt forces the model into a fixed schema so results are directly usable by downstream systems (a ticketing tool, a dashboard) without extra parsing logic.
- **Claude Sonnet** was chosen as the model — strong instruction-following for structured output at a lower cost/latency than larger models, which matters if this runs on every incoming ticket in production.
- **Fail-safe validation layer.** The agent never trusts the model's raw output blindly. If the category/urgency is outside the allowed set, or confidence isn't a valid float, it falls back to a safe default (`General Inquiry` / `Medium`) and force-flags the ticket for a human — better to over-flag than to silently misroute something important.
- **Confidence threshold routes to humans, not to a category.** Rather than trying to force every ticket into a bucket, tickets below 0.6 confidence are explicitly marked `needs_human_review: true`. This is the core "decision boundary" of the agent (see below).

### Decision boundary (agent-specific deliverable)

The agent asks the model itself to self-report a confidence score (0.0–1.0) alongside the classification, and the system prompt explicitly instructs it to lower that score when:
- the ticket is vague or short,
- it could plausibly fit more than one category,
- the stated urgency doesn't match the described problem,
- or multiple unrelated issues are mixed into one ticket.

Any ticket scoring **below 0.6** is routed to `needs_human_review: true` instead of being auto-assigned. This threshold was chosen empirically as a reasonable "when in doubt, ask a human" cutoff — it's a single constant in `prompts.py` (`CONFIDENCE_THRESHOLD`) and easy to tune per team's risk tolerance (e.g. a team handling security reports might raise it to 0.8).

Separately, if the model returns malformed output that fails validation (bad category name, non-numeric confidence, etc.), the ticket is **force-flagged** regardless of the confidence score — that's a hard rule, not a threshold, because malformed output means we can't trust the score itself.

---

## Tradeoffs & limitations

**What works:**
- End-to-end pipeline: load → classify → validate → route → save, on a batch of tickets.
- Defensive parsing (handles markdown-wrapped JSON, retries on transient failures).
- Sensible fallback behavior instead of crashes on bad model output.
- Ambiguous test cases specifically included to prove the review-flagging actually works, not just the happy path.

**What's missing / what I'd improve with more time:**
- **No real ticketing system integration.** This reads/writes local JSON. In production it would pull from a queue (Zendesk/Intercom webhook, etc.) and push routing decisions back via API.
- **No persistence/dedup.** Re-running the batch reclassifies everything from scratch; a real system would store results in a database and skip already-processed tickets.
- **No evaluation set with ground-truth labels.** I hand-picked tickets to be plausible and included intentionally ambiguous ones, but I don't have human-labeled "correct" answers to measure precision/recall against. With more time I'd build a small labeled eval set and track classification accuracy over prompt iterations.
- **Single LLM call per ticket, no self-consistency check.** For higher-stakes tickets (e.g. the security-report case), running the classification twice and comparing results would catch cases where the model is inconsistent, which is a stronger signal than a single self-reported confidence score.
- **Category list is fixed and small.** A real deployment would need this configurable per business, possibly with a "not sure, needs a new category" escape hatch.
- **Cost/latency at scale.** One API call per ticket is fine for a demo; a high-volume system might batch tickets or use a cheaper/smaller model for a first-pass filter before escalating ambiguous ones to a stronger model.

---

## Project structure

```
ticket-triage-agent/
├── agent.py              # Core classification logic (API call, parsing, validation, routing)
├── prompts.py             # System prompt, categories, routing map, confidence threshold
├── run_batch.py            # CLI: loads tickets, runs the agent, saves results
├── requirements.txt
├── data/
│   └── sample_tickets.json # 12 sample tickets (mix of clear-cut and ambiguous)
├── results/
│   └── sample_output.json  # Example output showing expected shape/quality
└── README.md
```
