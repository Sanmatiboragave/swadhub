from pathlib import Path
import json
import threading
import os
import sys
from flask import Flask, jsonify, request, render_template_string

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

# Load HTML template
HTML_TEMPLATE = open(str(BASE / "templates" / "index.html")).read()

@app.route("/", methods=["GET"])
def index():
    """Serve the HTML page"""
    return render_template_string(HTML_TEMPLATE)

@app.route("/results", methods=["GET"])
def results():
    """Get the latest results - matches what HTML expects"""
    if OUTPUT_PATH.exists():
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "no results"}), 404

@app.route("/run", methods=["POST"])
def run():
    """Start batch runner - matches what HTML expects"""
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

@app.route("/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({"status": "healthy"})

# For Vercel serverless
if __name__ != "__main__":
    # When running on Vercel, export the app as default
    pass

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
