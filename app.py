from pathlib import Path
import json
import threading
import os

from flask import Flask, render_template, jsonify, request

import run_batch
try:
    # Prefer the mock classifier for the browser UI so the web server
    # works without an Anthropic API key. If you want the real model,
    # change this to import `agent` and assign `run_batch.classify_ticket`.
    import mock_agent
    run_batch.classify_ticket = mock_agent.classify_ticket
except Exception:
    pass

BASE = Path(__file__).parent
INPUT_PATH = BASE / "sample_tickets.json"
OUTPUT_PATH = BASE / "results" / "output.json"

app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/results")
def results():
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify({"error": "no results"}), 404


@app.route("/run", methods=["POST"])
def run():
    """Start the batch runner in a background thread and return immediately."""

    def _run():
        try:
            # call the existing run() function from run_batch
            run_batch.run(str(INPUT_PATH), str(OUTPUT_PATH))
        except Exception as e:
            # write a simple fallback result so the UI can show the error
            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump({"error": str(e)}, f)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return jsonify({"status": "started"})


if __name__ == "__main__":
    # Default to port 8000 to match earlier usage
    app.run(host="127.0.0.1", port=8000)
