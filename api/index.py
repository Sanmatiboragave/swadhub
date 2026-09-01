from flask import Flask, jsonify
import json
import os
from pathlib import Path

app = Flask(__name__)

# Lazy imports - only when needed
HAS_BATCH = False
run_batch = None
mock_agent = None

def _init_batch():
    global HAS_BATCH, run_batch, mock_agent
    if HAS_BATCH:
        return
    try:
        import sys
        parent_dir = str(Path(__file__).parent.parent)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        import run_batch as rb
        import mock_agent as ma
        run_batch = rb
        mock_agent = ma
        rb.classify_ticket = ma.classify_ticket
        HAS_BATCH = True
    except Exception as e:
        print(f"Warning: Could not initialize batch: {e}")

BASE = Path(__file__).parent.parent
INPUT_PATH = BASE / "sample_tickets.json"
OUTPUT_PATH = BASE / "results" / "output.json"

# HTML content embedded
HTML_CONTENT = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Triage - UI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
        }
        h1 { color: #333; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 20px; }
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover { opacity: 0.9; }
        .status { margin-bottom: 20px; color: #666; }
        .loading { color: #667eea; font-weight: bold; }
        .error { color: #e74c3c; }
        .success { color: #27ae60; }
        h2 { margin-bottom: 15px; color: #333; }
        .results-container {
            background: #f9f9f9;
            border-radius: 4px;
            padding: 20px;
            min-height: 200px;
        }
        .ticket-item {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 8px;
        }
        .badge.critical { background: #e74c3c; color: white; }
        .badge.high { background: #f39c12; color: white; }
        .badge.medium { background: #f1c40f; color: #333; }
        .badge.low { background: #3498db; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Ticket Triage — Browser UI</h1>
        <p>Run the classification pipeline and view results in your browser.</p>
        
        <div class="controls">
            <button onclick="runAnalysis()">▶️ Run Classification</button>
            <button onclick="refreshResults()">🔄 Refresh Results</button>
        </div>
        
        <div class="status" id="status"></div>
        
        <h2>Results</h2>
        <div class="results-container" id="results">
            <p>(no results yet)</p>
        </div>
    </div>

    <script>
        async function runAnalysis() {
            const statusDiv = document.getElementById('status');
            const resultsDiv = document.getElementById('results');
            
            statusDiv.className = 'status loading';
            statusDiv.textContent = '⏳ Running analysis...';
            
            try {
                const response = await fetch('/run', { method: 'POST' });
                const data = await response.json();
                
                statusDiv.className = 'status success';
                statusDiv.textContent = '✅ Analysis started. Refreshing in 3 seconds...';
                
                setTimeout(refreshResults, 3000);
            } catch (err) {
                statusDiv.className = 'status error';
                statusDiv.textContent = '❌ Error: ' + err.message;
            }
        }

        async function refreshResults() {
            try {
                const response = await fetch('/results');
                const data = await response.json();
                
                const resultsDiv = document.getElementById('results');
                const statusDiv = document.getElementById('status');
                
                if (data.tickets && data.tickets.length > 0) {
                    let html = '';
                    data.tickets.forEach(ticket => {
                        const urgencyClass = (ticket.urgency || 'low').toLowerCase();
                        html += `
                            <div class="ticket-item">
                                <h3>${ticket.subject || 'Untitled'}</h3>
                                <p>${ticket.description || 'No description'}</p>
                                <div>
                                    <span class="badge ${urgencyClass}">${ticket.category || 'Uncategorized'}</span>
                                    <span class="badge">${ticket.urgency || 'Low'}</span>
                                </div>
                                <small>Confidence: ${(ticket.confidence * 100).toFixed(0)}%</small>
                            </div>
                        `;
                    });
                    resultsDiv.innerHTML = html;
                    statusDiv.className = 'status success';
                    statusDiv.textContent = '✅ Results loaded';
                } else {
                    resultsDiv.innerHTML = '<p>(no results yet)</p>';
                    statusDiv.textContent = '';
                }
            } catch (err) {
                document.getElementById('status').className = 'status error';
                document.getElementById('status').textContent = '❌ Error loading results: ' + err.message;
            }
        }

        // Auto-refresh results on page load
        window.addEventListener('load', refreshResults);
    </script>
</body>
</html>
"""

@app.route("/", methods=["GET"])
def index():
    """Serve the HTML page"""
    return HTML_CONTENT, 200, {"Content-Type": "text/html"}

@app.route("/results", methods=["GET"])
def results():
    """Get the latest results"""
    try:
        if OUTPUT_PATH.exists():
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data), 200
        return jsonify({"tickets": []}), 200
    except Exception as e:
        return jsonify({"error": str(e), "tickets": []}), 500

@app.route("/run", methods=["POST"])
def run():
    """Start batch runner"""
    _init_batch()
    if not HAS_BATCH:
        return jsonify({"status": "started", "warning": "Batch unavailable, using mock"}), 200
    
    import threading
    
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
    _init_batch()
    return jsonify({"status": "healthy", "has_batch": HAS_BATCH}), 200