# Actium — Debt & Legal Document Generation Platform

Actium is a browser-based MVP for mass generation of legally significant documents from templates.  
Step 1 (v0.1.0) delivers a minimal but working DOCX workflow: upload template, upload data, map fields, generate DOCX (single or batch ZIP).  
Step 1.1 (v0.1.1) adds an optional AI backend for data summary and mapping advice.

## Goal (Step 1, v0.1.0)

- Accept a DOCX template with `{{field_name}}` placeholders
- Accept CSV/XLSX data with headers
- Provide a 2-column mapping UI (template placeholders - data from table)
- Generate filled DOCX (single) or ZIP of DOCX (batch)

Out of scope for Step 1 (v0.1.0): PDF, preview, backend, AI, external services.  
Step 1.1 keeps DOCX-only and adds a minimal AI backend (optional).

## Product Context

**Problem:** Mass filling of legally significant documents is performed manually, slowly, with errors, in conditions of strict regulation and limited resources.  
**Solution:** Template generation: all logic is built around substituting fields into a template from lawyers.

## Tech Stack (Step 1)

- React (latest stable) + TypeScript + Vite
- `docxtemplater`, `pizzip` — DOCX parsing/generation
- `xlsx` (SheetJS) — XLSX parsing
- `papaparse` — CSV parsing
- `jszip` — batch ZIP
- `file-saver` — downloads
- i18n (EN/RU)
- FastAPI (AI backend, optional)
- `langchain-gigachat` — GigaChat integration

## Engineering Principles

- Client-side only (no backend for v0.1.0)
- Strict TypeScript and separation of concerns (parsing/mapping/generation)
- Docker-first workflow (Linux container), even on Windows host
- CI/CD ready (GitHub Actions), deployable to Vercel

## Filename Rules (Generation)

- Filenames are built from sanitized field values
- Row index suffix is always added to prevent ZIP duplicates
- If all values are empty, use `document_###.docx`

## Documents

- Requirements: `docs/REQUIREMENTS/FR_v0.1.0.md`, `docs/REQUIREMENTS/NFR_v0.1.0.md`
- MVP plan: `docs/VERSION_PLANS/PLAN_v0.1.0.md`
- v0.1.1 AI: `docs/REQUIREMENTS/FR_v0.1.1.md`, `docs/VERSION_PLANS/PLAN_v0.1.1.md`, `docs/ADR/ADR_v0.1.1.md`
- Roadmap: `docs/ROADMAP.md`

## Quick MVP Plan (Summary)

1. Workspace setup (Vite React TS, linting, Docker, CI)
2. i18n scaffolding (EN/RU)
3. Template upload + placeholder extraction
4. Data upload + preview (CSV/XLSX)
5. Mapping UI (2-column) + JSON import/export
6. Generation (single + batch ZIP) + naming rules
7. Validation + error reporting
8. Minimal tests + documentation

## Notes for Local Development

- Target environment: Windows (PowerShell), but build/run inside Linux containers.
- Install latest Node.js and package manager on host only if needed for editor tooling.

## Build and Run

From repository root:

```
cd apps/web
npm install
npm run dev
```

Lint:

```
cd apps/web
npm run lint
```

Docker (Linux container, recommended on Windows):

```
docker compose up --build
```

Production build:

```
cd apps/web
npm run build
npm run preview
```

## AI Backend (optional, v0.1.1)

Backend runs locally to keep credentials off the client.

```
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `apps/api/.env` and set `GIGACHAT_CREDENTIALS`.

Run the API:

```
cd apps/api
uvicorn main:app --reload --port 8001
```

Frontend calls the API at `http://localhost:8001` by default.  
To override, set `VITE_API_BASE_URL` in your local Vite env (not committed).

## Docker Compose (frontend + backend)

```
cp apps/api/.env.example apps/api/.env
docker compose up --build
```

Open UI: `http://localhost:5173`  
API: `http://localhost:8001`
