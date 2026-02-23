# Non-Functional Requirements (NFR) — Step 1 (v0.1.0)

## NFR-1 Performance

- Single document generation ≤ 1 second (typical template size).
- Batch 100 documents ≤ 30 seconds (browser dependent).

## NFR-2 Simplicity

- No background jobs.
- No async backend calls.
- No authentication.

## NFR-3 Maintainability

- Strict TypeScript.
- Clear separation: parsing, mapping, generation.

## NFR-4 Compatibility

- Desktop browsers only.
- Client-side only.

## NFR-5 Localization

- UI supports i18n and l10n in English and Russian.

## NFR-6 Build & Delivery

- Docker-first development (Linux container).
- CI/CD via GitHub Actions.
- Deployable to Vercel.
