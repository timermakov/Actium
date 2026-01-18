# MVP Plan — Step 1 (v0.1.0)

This plan focuses only on the ultra-minimal, buildable MVP described in the requirements.

## Constraints

- Client-side only, no backend.
- DOCX in, DOCX out.
- No PDF, no preview, no AI.
- Windows host (PowerShell), Linux container for build/run.

## Step-by-Step Plan

### 1) Repository & Tooling Baseline

- Initialize Vite React + TypeScript app.
- Add ESLint + Prettier with strict TypeScript.
- Add Dockerfile + docker-compose for Linux-based development.
- Add GitHub Actions workflow for CI (lint, typecheck, build).
- Add Vercel deployment config.

Deliverable: app boots in browser via Docker, CI green.

### 2) Internationalization (EN/RU)

- Add i18n framework (e.g., `react-i18next`).
- Create EN and RU locale files.
- Provide language switcher in UI (minimal).

Deliverable: UI strings fully localizable.

### 3) Template Upload + Placeholder Extraction

- Upload DOCX file via browser.
- Parse DOCX and extract placeholders `{{field_name}}`.
- Show unique fields in a list.

Deliverable: placeholder list appears after upload.

### 4) Data Upload + Preview

- Upload CSV or XLSX file.
- Parse headers and rows.
- Render preview table (first 10 rows).

Deliverable: data preview visible after upload.

### 5) Field Mapping (2-Column)

- Render mapping table (template fields vs data columns).
- Dropdowns for each template field.
- Validate all fields mapped.
- Import/export mapping JSON.

Deliverable: mapping can be saved/restored and validated.

### 6) Generation (Single + Batch)

- Single-row generation using selected row.
- Batch generation for all rows.
- File naming with mapped values, fallback if empty.
- ZIP all batch outputs.

Deliverable: DOCX and ZIP downloads work end-to-end.

### 7) Validation & Error Handling

- File type checks for uploads.
- Missing mapping blocks generation.
- Row-level errors collected and shown after batch.

Deliverable: stable UX with clear errors.

### 8) Minimal Tests & Docs

- Unit tests for parsing and mapping utils.
- Basic smoke test for generation.
- Update docs and changelog.

Deliverable: core logic covered by tests; docs current.

## Milestones

- M1: Tooling + i18n baseline
- M2: Uploads + parsing + mapping
- M3: Generation + ZIP + errors
- M4: Tests + docs + release tag v0.1.0

