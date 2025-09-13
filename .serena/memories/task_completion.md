# Task Completion Checklist

Use this checklist before calling a task "Done":

## Required
- E2E Acceptance: Ensure the QA agent run for the current iteration is GREEN.
  - Check QA logs: `grep -R "E2E\s*:\s*GREEN\|\{\"status\":\"green\"\}" out/qa-*.log`
- Deliverables: Provide execution details as diffs (patches) or exact commands, per AGENTS.md policy.
- Idempotency: Confirm commands/scripts can be re-run without breaking existing assets; include rollback guidance for failures.

## Commands to Run (when applicable)
- Orchestrator: `yarn orchestrate` (or run specific agents as needed).
- Installation (if deps changed): `yarn install`.
- Tests/Lint/Format: Not currently configured in this repo. If you add tools, expose them via `package.json` scripts and document.

## Documentation
- Update or generate docs when behavior/entrypoints change:
  - If Architect scaffolds a framework, add/start a README and update memory files.
  - Keep `suggested_commands.md` and `project_overview.md` in sync with changes.

## Artifacts
- Ensure relevant logs are stored under `out/` and referenced in your handoff (e.g., `out/qa-*.log`, `out/docs-*.log`).