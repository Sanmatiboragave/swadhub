"""
Batch runner for the Support Ticket Triage Agent.

Usage:
    python run_batch.py
    python run_batch.py --input data/sample_tickets.json --output results/output.json
"""

import argparse
import json
import sys

# `classify_ticket` is imported dynamically after parsing CLI args so we can
# optionally run with a local mock classifier (no API key required) using
# the --mock flag.


def load_tickets(path: str) -> list:
    with open(path, "r") as f:
        return json.load(f)


def run(input_path: str, output_path: str) -> None:
    tickets = load_tickets(input_path)
    print(f"Loaded {len(tickets)} tickets from {input_path}\n")

    results = []
    for i, ticket in enumerate(tickets, 1):
        ticket_id = ticket.get("id", f"ticket-{i}")
        subject = ticket["subject"]
        body = ticket["body"]

        print(f"[{i}/{len(tickets)}] Classifying {ticket_id}: {subject!r}")
        result = classify_ticket(subject, body)
        result["id"] = ticket_id

        flag = "  <-- FLAGGED FOR HUMAN REVIEW" if result["needs_human_review"] else ""
        print(
            f"    -> category={result['category']!r} "
            f"urgency={result['urgency']!r} "
            f"confidence={result['confidence']:.2f} "
            f"team={result['routed_team']!r}{flag}"
        )

        results.append(result)

    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    flagged = sum(1 for r in results if r["needs_human_review"])
    print(f"\nDone. {len(results)} tickets classified, {flagged} flagged for human review.")
    print(f"Full results written to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the ticket triage agent on a batch of tickets.")
    parser.add_argument("--input", default="sample_tickets.json", help="Path to input JSON file")
    parser.add_argument("--output", default="results/output.json", help="Path to write results JSON")
    parser.add_argument("--mock", action="store_true", help="Use local mock classifier (no API key required)")
    args = parser.parse_args()

    # Import the appropriate classifier based on the CLI flag. Importing the
    # real `agent` module will attempt to read `ANTHROPIC_API_KEY`, so only do
    # that when not running in mock mode.
    try:
        if args.mock:
            from mock_agent import classify_ticket  # type: ignore
        else:
            from agent import classify_ticket  # type: ignore

        run(args.input, args.output)
    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
