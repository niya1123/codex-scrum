# Suggested Commands

## Setup
- `yarn install`: Install dev dependencies (e.g., `tsx`).
- `node -v && yarn -v`: Verify Node LTS (>=20) and Yarn 1.x are available.
- `codex --help`: Verify Codex CLI is installed and available in PATH.

## Orchestration
- `yarn orchestrate`: Run the full agent loop (PO→Architect→Planner→Dev-FE/Dev-BE→QA→Docs).
  - `MAX_ITERS=3 PARALLEL_DEVS=2 yarn orchestrate`: Override defaults.
- Artifacts are written under `out/`:
  - `out/backlog.yml`, `out/tasks.yml`, `out/scaffold.log`, `out/dev-fe-*.log`, `out/dev-be-*.log`, `out/qa-*.log`, `out/docs-*.log`.

## Run Agents Individually
- `codex run --agent po --input prompts/po.md`
- `codex run --agent architect --input out/backlog.yml`
- `codex run --agent planner --input out/backlog.yml`
- `codex run --agent dev-fe --input out/tasks.yml`
- `codex run --agent dev-be --input out/tasks.yml`
- `codex run --agent qa --input out/tasks.yml`
- `codex run --agent docs --input out/tasks.yml`

## Inspection & Diagnostics
- `sed -n '1,200p' scripts/orchestrator.ts`: Quick source inspection on macOS.
- `grep -R "E2E\s*:\s*GREEN\|\{\"status\":\"green\"\}" out/`: Check QA success tokens.
- `ls -lah out/`: Review produced artifacts.

## Useful macOS (Darwin) Utilities
- `open out/qa-1.log`: Open a file in default app.
- `pbcopy < file` / `pbpaste > file`: Copy/paste via clipboard.
- `find . -name "*.ts" -not -path "*/node_modules/*"`: Locate TypeScript files.
- `git status && git diff`: Review tracked changes.

## Cleanup
- `rm -rf out/`: Remove generated artifacts (safe to regenerate with `yarn orchestrate`).