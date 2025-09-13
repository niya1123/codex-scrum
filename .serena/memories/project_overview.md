# Project Overview

- Purpose: Orchestrate an AI-driven Scrum workflow (PO→Architect→Planner→Dev-FE/Dev-BE→QA→Docs) to build a travel-planning MVP. The repository contains an orchestrator that runs Codex CLI agents with role-specific prompts to iteratively deliver features until QA is green.
- Platform: macOS (Darwin).

## Tech Stack
- Runtime: Node.js (LTS recommended, >= 20).
- Language: TypeScript (executed via `tsx`).
- Package manager: Yarn Classic (1.x) per `package.json`.
- Tooling: Codex CLI (`codex`) to run agents; no framework is scaffolded yet — Architect agent is expected to generate app scaffolding later.

## Directory Structure (high-level)
- `scripts/orchestrator.ts`: Main entry that runs the agent loop via `codex run` and manages iterations, parallel Dev roles, and QA checks.
- `prompts/`: Role prompts (`po.md`, `architect.md`, `planner.md`, `dev-fe.md`, `dev-be.md`, `qa.md`, `docs.md`).
- `AGENTS.md`: Working agreements and handoff contracts for each role.
- `SCRUM.md`: Team working agreement and Definition of Done.
- `.serena/project.yml`: Serena configuration for this repository.
- `out/` (generated): Logs and artifacts produced by running the orchestrator.

## Entrypoints
- Orchestrator: `yarn orchestrate` (runs `tsx scripts/orchestrator.ts`).
  - Environment variables:
    - `MAX_ITERS` (default 3): maximum iterations of Dev/QA loop.
    - `PARALLEL_DEVS` (default 2): run Dev-FE/Dev-BE in parallel (1 = FE only, 2 = FE+BE).
- Individual agents (examples):
  - `codex run --agent po --input prompts/po.md`
  - `codex run --agent architect --input out/backlog.yml`
  - `codex run --agent planner --input out/backlog.yml`
  - `codex run --agent qa --input out/tasks.yml`

## Notes
- Architect is responsible for choosing and scaffolding the actual app stack (e.g., Next.js/Remix/etc.) later. Until then, this repo focuses on orchestration and process.
- The orchestrator considers the loop successful when QA output contains a green token (e.g., `E2E: GREEN` or `{"status":"green"}`).