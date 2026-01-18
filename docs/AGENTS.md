# AI Agents — Best Practices and Strict Behavior

This project uses AI agents to accelerate delivery. Follow these rules strictly.

## Non-Negotiable Rules

- Do not change scope without explicit user request.
- Do not remove or revert user changes.
- Do not use destructive git commands (no hard reset, no force push).
- Do not edit files unrelated to the request.
- Do not add heavy dependencies or backend services in v0.1.0.
- Do not hide problems, tell user about them. Then try to solve by yourself.

## Workflow Expectations

- Read relevant docs before editing.
- Keep changes minimal and targeted.
- Use clear file paths and consistent naming.
- Prefer small, auditable commits when asked to commit.
- Always update docs when behavior changes.

## Environment and Tooling

- Host OS: Windows with PowerShell; build runs in Docker - Linux containers.
- Quote paths with spaces in shell commands.
- Use project tools (Docker, Vite) over ad-hoc scripts.
- Install latest versions of required dependencies when needed.

## Code Quality Standards

- Use best practices of frontend and backend development.
- OOP, DRY, KISS, YAGNI principles must-have.
- Do not write overcomplicated code, should be efficient, but readable.
- Use latest stable release of React and other libraries, if possible. If not, downgrade if it will help.
- Use Strict TypeScript; avoid `any`.
- Separate concerns: parsing, mapping, generation, UI.
- Validate inputs and provide user-friendly error messages.
- Favor deterministic behavior over "smart" heuristics.
- Write meaningful tests covering only main logic using Vitest
- Debug problems deeply, when user writes "fix ..." you should research for the problem's root, explain it, debug it and make a fix.

## UI, UX and i18n

- All user-facing strings must go through i18n and l10n (EN/RU).
- Keep UI minimalistic, simple and functional for v0.1.0. (should not be default, or ugly, or legacy design, but looking great as CRM design should be and also minimalistic, aesthetic and strict - without fancy hype colors and visuals effects)

## Security and Privacy

- Do not send user data to external services for now.
- Do not add telemetry or analytics in v0.1.0.
- Keep processing in-memory and client-side.

## Documentation Discipline

- Regularly update `README.md` with the most important information according to common GitHub contributors style (do not use emojis, be strict and concise)
- Add! (not rewrite but add new file with new version number) architecture decision records (ADR/ADR_vX.Y.Z), plans (PLAN/PLAN_vX.Y.Z) and requirements when significant decisions happens. Always write them step-by-step, format them well.
- Use short, clear sections and sentences; avoid duplication.
- After each change read documentation related and change it if needed. Docs should be always up to date with code.

## Comments Discipline

- Write comments on the standards for documenting code only when some modules, functions description, or difficult points are needed to be described (no need for small things, do not write obvious comments too).

## Git

- Use git tools, git flow. Make branches for features, commit regularly when part of work done and working correctly.

## Improve yourself on errors

Append this file with important information you studied from errors or solutions found regularly.

## Learnings

- `vercel.json` schema rejects `rootDirectory`; use `installCommand`/`buildCommand` with `cd` and set `outputDirectory` to monorepo app output.
