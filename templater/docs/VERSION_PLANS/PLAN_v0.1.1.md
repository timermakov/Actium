# MVP Plan — Step 1.1 (v0.1.1)

This plan adds AI assistance and lightweight data insights without changing the core DOCX workflow.

## Constraints

- Keep client-side DOCX generation intact.
- Do not expose AI credentials in the browser.
- Minimal backend (FastAPI only).

## Step-by-Step Plan

### 1) Backend (FastAPI)

- Create `apps/api` with minimal FastAPI app.
- Add `/ai/summary` and `/ai/advice` endpoints using GigaChat via LangChain.
- Configure credentials via `.env` (never committed).

### 2) Frontend AI Assistant

- Add AI Assistant card with two actions: Summary and Advice.
- Render AI response in a clean, readable block.

### 3) Data & Mapping Insights

- Show data quality metrics (rows, columns, empty cells, duplicates).
- Display mapping health with percent mapped and unmapped fields.
- Add smart default mapping based on column name matches.

### 4) Docs & Validation

- Update README with backend setup.
- Add v0.1.1 ADR and requirements.
- Run build to ensure front and backend start correctly.
