<# Start the aggregates API with uvicorn. #>
$env:PYTHONPATH = "$PWD"
Write-Host "Starting FastAPI aggregates API on http://127.0.0.1:8001"
python -m uvicorn food-delivery-analytics.api.aggregates_api:app --reload --port 8001
