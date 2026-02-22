# Architecture Decision Records (ADR) — v0.1.0

This document captures key architectural decisions for the Step 1 MVP.

## ADR-001: Client-side only (no backend)

- **Status:** Accepted
- **Context:** Step 1 targets the fastest viable MVP with minimal ops and cost.
- **Decision:** Implement all functionality in the browser; no server-side APIs.
- **Consequences:** Limited scalability, no persistence, and browser-only file processing.

## ADR-002: DOCX template placeholders using `{{field_name}}`

- **Status:** Accepted
- **Context:** Legal templates are authored by humans; placeholders must be easy to insert and review.
- **Decision:** Use `{{field_name}}` as the placeholder syntax across the MVP.
- **Consequences:** Template authors must follow a consistent placeholder convention.

## ADR-003: DOCX generation via `docxtemplater` + `pizzip`

- **Status:** Accepted
- **Context:** Need a browser-compatible, lightweight DOCX templating approach.
- **Decision:** Use `docxtemplater` with `pizzip` for parsing and generating DOCX.
- **Consequences:** Limited to text replacement in v0.1.0; advanced DOCX features deferred.

## ADR-004: Data ingestion via CSV/XLSX only

- **Status:** Accepted
- **Context:** Most source data is exported from legacy systems as CSV or XLSX.
- **Decision:** Support CSV and XLSX using `papaparse` and `xlsx` (SheetJS).
- **Consequences:** Other formats are out of scope for v0.1.0.

## ADR-005: Two-column mapping UI

- **Status:** Accepted
- **Context:** Minimize cognitive load while remaining flexible.
- **Decision:** Provide a two-column mapping table (template field -> data column).
- **Consequences:** Advanced mapping (expressions, transforms) deferred.

## ADR-006: Output is DOCX only, batch as ZIP

- **Status:** Accepted
- **Context:** Reduce complexity and avoid PDF/preview dependencies.
- **Decision:** Output only DOCX; batch generation is packaged as ZIP using `jszip`.
- **Consequences:** No PDF export or merged documents in v0.1.0.

## ADR-007: Simple i18n (EN/RU)

- **Status:** Accepted
- **Context:** Target users operate in English and Russian.
- **Decision:** Provide English and Russian UI strings with a minimal language switcher.
- **Consequences:** All UI text must be sourced through the i18n layer.

## ADR-008: Docker-first development and CI/CD

- **Status:** Accepted
- **Context:** The team works on Windows; build should be Linux-consistent and reproducible.
- **Decision:** Use Docker for local development and GitHub Actions for CI.
- **Consequences:** Local tooling must run in containers or be optional.
