from pathlib import Path
import json
import threading
import os
import sys
from flask import Flask, jsonify, request

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import run_batch
try:
    import mock_agent
    run_batch.classify_ticket = mock_agent.classify_ticket
except Exception:
    pass

BASE = Path(__file__).parent.parent
INPUT_PATH = BASE / "sample_tickets.json"
OUTPUT_PATH = BASE / "results" / "output.json"

app = Flask(__name__)

@app.route("/api/results", methods=["GET"])
def results():
    """Get the latest results"""
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify({"error": "no results"}), 404

@app.route("/api/run", methods=["POST"])
def run():
    """Start the batch runner in a background thread"""
    def _run():
        try:
            run_batch.run(str(INPUT_PATH), str(OUTPUT_PATH))
        except Exception as e:
            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump({"error": str(e)}, f)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return jsonify({"status": "started"})

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

@app.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({"message": "Support Ticket Triage Agent API"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
