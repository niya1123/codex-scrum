# Style and Conventions

## Coding Style
- Language: TypeScript executed with `tsx` (ESM modules). Prefer explicit types and readable names.
- No linter/formatter pinned yet (no ESLint/Prettier configs in repo). Default to conventional TypeScript/Node style; keep functions small and cohesive.
- Keep changes minimal and focused on the task. Avoid unrelated refactors.

## Process Conventions (from AGENTS.md)
- Two-phase changes: "提案 → 実行". Proposals include rationale and comparison where relevant; execution provides a diff (patch) or exact commands.
- All automated changes must be idempotent (re-runnable) and non-destructive. Include rollback instructions on failure.
- Done definition: AC-aligned E2E is GREEN.

## Repository Conventions
- Human-readable directory and file names; document entrypoints and commands.
- Prefer environment-configurable behavior (e.g., `MAX_ITERS`, `PARALLEL_DEVS`).
- If introducing tooling later (ESLint/Prettier/Tests), ensure commands are added to `package.json` scripts and documented in README/memories.

## Testing Philosophy
- QA agent executes acceptance/E2E per `prompts/qa.md`. Success tokens (e.g., `E2E: GREEN` or `{ "status": "green" }`) indicate acceptance.
- Architect/Planner may introduce additional test frameworks (e.g., Playwright/Vitest); adhere to their conventions when scaffolded.