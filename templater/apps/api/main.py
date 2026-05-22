from __future__ import annotations

import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
try:
    from langchain_gigachat import GigaChat
except ImportError:  # pragma: no cover - fallback for older package layout
    from langchain_gigachat.chat_models import GigaChat
from pydantic import BaseModel, Field
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

load_dotenv()

AI_SUMMARY_PATH = "/ai/summary"
AI_ADVICE_PATH = "/ai/advice"

AI_ERROR_RESPONSES: dict[int, dict[str, str]] = {
    400: {"description": "Invalid request payload"},
    500: {"description": "AI service or configuration error"},
}

DEFAULT_CORS_ORIGINS = "https://actium-docs.vercel.app"

# Prometheus metrics
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "path", "status"],
)
HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "path", "status"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)
HTTP_REQUESTS_IN_FLIGHT = Gauge(
    "http_requests_in_flight",
    "Number of HTTP requests currently being served",
)
AI_REQUESTS_TOTAL = Counter(
    "ai_requests_total",
    "Total number of AI requests",
    ["endpoint", "status"],
)
AI_REQUEST_DURATION_SECONDS = Histogram(
    "ai_request_duration_seconds",
    "AI request duration in seconds",
    ["endpoint"],
    buckets=[0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0],
)


def trim_trailing_slashes(value: str) -> str:
    end = len(value)
    while end > 0 and value[end - 1] == "/":
        end -= 1
    return value[:end]


def parse_cors_origins(raw_value: str) -> list[str]:
    origins: list[str] = []
    for origin in raw_value.split(","):
        cleaned = trim_trailing_slashes(origin.strip())
        if cleaned:
            origins.append(cleaned)
    return origins


app = FastAPI(title="Actium AI API", version="0.1.2")

raw_origins = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(raw_origins),
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Middleware to collect Prometheus metrics for all requests."""
    start_time = time.time()
    path = request.url.path
    method = request.method

    HTTP_REQUESTS_IN_FLIGHT.inc()
    try:
        response = await call_next(request)
        status = str(response.status_code)
    except Exception as exc:
        status = "500"
        raise exc
    finally:
        HTTP_REQUESTS_IN_FLIGHT.dec()

    duration = time.time() - start_time
    HTTP_REQUESTS_TOTAL.labels(method=method, path=path, status=status).inc()
    HTTP_REQUEST_DURATION_SECONDS.labels(method=method, path=path, status=status).observe(duration)

    return response


@app.get("/metrics", response_class=PlainTextResponse)
def metrics():
    """Prometheus metrics endpoint."""
    return PlainTextResponse(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/health")
def health():
    """Health check endpoint for Kubernetes."""
    return {"status": "healthy", "service": "ai-backend"}


class SummaryRequest(BaseModel):
    columns: list[str] = Field(default_factory=list)
    row_count: int = 0
    sample_rows: list[dict[str, str]] = Field(default_factory=list)
    empty_cells: int = 0
    empty_rows: int = 0
    duplicate_rows: int = 0
    language: str = "ru"


class AdviceRequest(BaseModel):
    template_fields: list[str] = Field(default_factory=list)
    columns: list[str] = Field(default_factory=list)
    mapping: dict[str, str] = Field(default_factory=dict)
    unmapped_fields: list[str] = Field(default_factory=list)
    row_count: int = 0
    empty_cells: int = 0
    empty_rows: int = 0
    duplicate_rows: int = 0
    language: str = "ru"


class AIResponse(BaseModel):
    content: str


def get_client() -> GigaChat:
    credentials = os.getenv("GIGACHAT_CREDENTIALS")
    if not credentials:
        raise HTTPException(status_code=500, detail="GIGACHAT_CREDENTIALS is missing.")
    model = os.getenv("GIGACHAT_MODEL", "gigachat-2")
    scope = os.getenv("GIGACHAT_SCOPE", "GIGACHAT_API_PERS")
    verify_ssl = os.getenv("GIGACHAT_VERIFY_SSL", "false").lower() in {"1", "true", "yes"}
    return GigaChat(
        credentials=credentials,
        scope=scope,
        model=model,
        verify_ssl_certs=verify_ssl,
    )


@app.post(AI_SUMMARY_PATH, responses=AI_ERROR_RESPONSES)
def generate_summary(payload: SummaryRequest) -> AIResponse:
    start_time = time.time()
    if payload.row_count <= 0 or not payload.columns:
        AI_REQUESTS_TOTAL.labels(endpoint=AI_SUMMARY_PATH, status="4xx").inc()
        raise HTTPException(status_code=400, detail="Empty dataset.")
    language = "Russian" if payload.language.lower().startswith("ru") else "English"
    prompt = (
        f"Respond in {language}. Give 4-6 concise bullets, each <=12 words.\n"
        "Summarize data quality for a legal document workflow.\n"
        f"Columns: {payload.columns}\n"
        f"Row count: {payload.row_count}\n"
        f"Empty cells: {payload.empty_cells}\n"
        f"Empty rows: {payload.empty_rows}\n"
        f"Duplicate rows: {payload.duplicate_rows}\n"
        f"Sample rows: {payload.sample_rows}\n"
    )
    try:
        client = get_client()
        response = client.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        AI_REQUESTS_TOTAL.labels(endpoint=AI_SUMMARY_PATH, status="2xx").inc()
        AI_REQUEST_DURATION_SECONDS.labels(endpoint=AI_SUMMARY_PATH).observe(time.time() - start_time)
        return AIResponse(content=str(content))
    except HTTPException as he:
        status_label = str(he.status_code)[0] + "xx"
        AI_REQUESTS_TOTAL.labels(endpoint=AI_SUMMARY_PATH, status=status_label).inc()
        raise
    except Exception as exc:
        AI_REQUESTS_TOTAL.labels(endpoint=AI_SUMMARY_PATH, status="5xx").inc()
        raise HTTPException(status_code=500, detail=f"AI request failed: {exc}") from exc


@app.options(AI_SUMMARY_PATH)
def summary_preflight() -> Response:
    return Response(status_code=204)


@app.post(AI_ADVICE_PATH, responses=AI_ERROR_RESPONSES)
def generate_advice(payload: AdviceRequest) -> AIResponse:
    start_time = time.time()
    if not payload.template_fields:
        AI_REQUESTS_TOTAL.labels(endpoint=AI_ADVICE_PATH, status="4xx").inc()
        raise HTTPException(status_code=400, detail="Template fields are missing.")
    language = "Russian" if payload.language.lower().startswith("ru") else "English"
    prompt = (
        f"Respond in {language}. Provide 4-6 checklist bullets, each <=12 words.\n"
        "Advise on mapping quality, missing data, and naming consistency.\n"
        f"Template fields: {payload.template_fields}\n"
        f"Data columns: {payload.columns}\n"
        f"Current mapping: {payload.mapping}\n"
        f"Unmapped fields: {payload.unmapped_fields}\n"
        f"Row count: {payload.row_count}\n"
        f"Empty cells: {payload.empty_cells}\n"
        f"Empty rows: {payload.empty_rows}\n"
        f"Duplicate rows: {payload.duplicate_rows}\n"
    )
    try:
        client = get_client()
        response = client.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        AI_REQUESTS_TOTAL.labels(endpoint=AI_ADVICE_PATH, status="2xx").inc()
        AI_REQUEST_DURATION_SECONDS.labels(endpoint=AI_ADVICE_PATH).observe(time.time() - start_time)
        return AIResponse(content=str(content))
    except HTTPException as he:
        status_label = str(he.status_code)[0] + "xx"
        AI_REQUESTS_TOTAL.labels(endpoint=AI_ADVICE_PATH, status=status_label).inc()
        raise
    except Exception as exc:
        AI_REQUESTS_TOTAL.labels(endpoint=AI_ADVICE_PATH, status="5xx").inc()
        raise HTTPException(status_code=500, detail=f"AI request failed: {exc}") from exc


@app.options(AI_ADVICE_PATH)
def advice_preflight() -> Response:
    return Response(status_code=204)
