# Tech Stack — v0.1.0

This document defines the minimal, stable stack for Step 1 MVP.

## Runtime

- Node.js (latest LTS)
- npm (latest stable)

## Frontend

- React (latest stable)
- TypeScript (strict)
- Vite
- Material UI: https://mui.com/material-ui/llms.txt

## Core Libraries

- `docxtemplater` + `pizzip` — DOCX parsing and generation
- `xlsx` (SheetJS) — XLSX parsing
- `papaparse` — CSV parsing
- `jszip` — batch ZIP packaging
- `file-saver` — browser downloads
- `i18next` + `react-i18next` — i18n (EN/RU)

## Testing

- Vitest

## Tooling

- ESLint
- Prettier
- Docker (Linux containers)

## CI/CD and Deployment

- GitHub Actions (lint, typecheck, build)
- Vercel (frontend deployment)
