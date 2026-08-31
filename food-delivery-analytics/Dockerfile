FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir fastapi uvicorn[standard] pandas
EXPOSE 8001
CMD ["python", "-m", "uvicorn", "food-delivery-analytics.api.aggregates_api:app", "--host", "0.0.0.0", "--port", "8001"]
