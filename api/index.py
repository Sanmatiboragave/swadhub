from pathlib import Path
import json
import threading
import os
import sys
from flask import Flask, jsonify, render_template_string

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
try:
    HTML_TEMPLATE = open(str(BASE / "templates" / "index.html")).read()
except:
    HTML_TEMPLATE = "<h1>Ticket Triage</h1>"

@app.route("/", methods=["GET"])
def index():
    """Serve the HTML page"""
    return render_template_string(HTML_TEMPLATE)

@app.route("/results", methods=["GET"])
def results():
    """Get the latest results"""
    if OUTPUT_PATH.exists():
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"error": str(e), "tickets": []}), 500
    return jsonify({"tickets": []}), 200

@app.route("/run", methods=["POST"])
def run():
    """Start batch runner"""
    def _run():
        try:
            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            run_batch.run(str(INPUT_PATH), str(OUTPUT_PATH))
        except Exception as e:
            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump({"error": str(e), "tickets": []}, f)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return jsonify({"status": "started"}), 200

@app.route("/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
