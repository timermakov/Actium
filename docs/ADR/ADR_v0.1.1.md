# Architecture Decision Records (ADR) — v0.1.1

This document captures key architectural decisions for the v0.1.1 iteration.

## ADR-009: Minimal AI backend for GigaChat

- **Status:** Accepted
- **Context:** GigaChat credentials must not be exposed in the browser; AI features require a secure server-side proxy.
- **Decision:** Introduce a minimal FastAPI backend (`apps/api`) with two endpoints: `/ai/summary` and `/ai/advice`.
- **Consequences:** Local dev requires running the API service; secrets are stored only in `.env` and never committed.

## ADR-010: GigaChat via LangChain integration

- **Status:** Accepted
- **Context:** Need a stable client for GigaChat with model selection and scope control.
- **Decision:** Use `langchain-gigachat` with model set to `gigachat-2` and scope `GIGACHAT_API_PERS`.
- **Consequences:** Adds a lightweight Python dependency and requires env configuration for credentials.
