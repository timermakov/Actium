# Actium — Debt & Legal Document Generation Platform

Actium is a browser-based MVP for mass generation of legally significant documents from templates.  
Step 1 (v0.1.0) delivers a minimal but working DOCX workflow: upload template, upload data, map fields, generate DOCX (single or batch ZIP).

## Goal (Step 1, v0.1.0)

- Accept a DOCX template with `{{field_name}}` placeholders
- Accept CSV/XLSX data with headers
- Provide a 2-column mapping UI
- Generate filled DOCX (single) or ZIP of DOCX (batch)

Out of scope for Step 1: PDF, preview, backend, AI, external services.

## Product Context (RU)

**Problem:** Массовое заполнение юридически значимых документов выполняется вручную, медленно, с ошибками, в условиях жёсткого регулирования и ограниченных ресурсов.  
**Solution:** Генерация по шаблону: вся логика строится вокруг подстановки полей в шаблон от юристов.

## Tech Stack (Step 1)

- React 18 + TypeScript + Vite
- `docxtemplater`, `pizzip` — DOCX parsing/generation
- `xlsx` (SheetJS) — XLSX parsing
- `papaparse` — CSV parsing
- `jszip` — batch ZIP
- `file-saver` — downloads
- i18n (EN/RU)

## Engineering Principles

- Client-side only (no backend for v0.1.0)
- Strict TypeScript and separation of concerns (parsing/mapping/generation)
- Docker-first workflow (Linux container), even on Windows host
- CI/CD ready (GitHub Actions), deployable to Vercel

## Documents

- Requirements: `docs/REQUIREMENTS/FR_v0.1.0.md`, `docs/REQUIREMENTS/NFR_v0.1.0.md`
- MVP plan: `docs/PLAN/MVP_STEP1_v0.1.0.md`
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
