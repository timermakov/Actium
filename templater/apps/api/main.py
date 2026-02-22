from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
try:
    from langchain_gigachat import GigaChat
except ImportError:  # pragma: no cover - fallback for older package layout
    from langchain_gigachat.chat_models import GigaChat
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Actium AI API", version="0.1.1")

raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,https://actium-docs.vercel.app",
)
origins = [
    origin.strip().rstrip("/")
    for origin in raw_origins.split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


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


@app.post("/ai/summary", response_model=AIResponse)
def generate_summary(payload: SummaryRequest) -> AIResponse:
    if payload.row_count <= 0 or not payload.columns:
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
        return AIResponse(content=str(content))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI request failed: {exc}") from exc


@app.options("/ai/summary")
def summary_preflight() -> Response:
    return Response(status_code=204)


@app.post("/ai/advice", response_model=AIResponse)
def generate_advice(payload: AdviceRequest) -> AIResponse:
    if not payload.template_fields:
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
        return AIResponse(content=str(content))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI request failed: {exc}") from exc


@app.options("/ai/advice")
def advice_preflight() -> Response:
    return Response(status_code=204)
