# Travel Planner MVP – Planner Backlog (Memory)

Stack (Architect): Next.js 14 + TypeScript (App Router), E2E: Playwright, Formatter: Prettier. API in `app/api`; health at `/health`. API samples live under `docs/samples/api/`.

Critical AC: AC-001 “行き先/日付入力→旅程JSON表示” must be Green first.

Must order: TPA-001 → TPA-002 → TPA-004 → TPA-003 → TPA-005 → TPA-007 → TPA-006 → TPA-008 (TPA-009 independent).

Tasks (owner/size/deps):
- TPA-001 (Form) — Dev-FE [S], QA [S], Docs [S]; deps: none.
- TPA-002 (Validation) — Dev-FE [M], Dev-BE [S], QA [S]; deps: 001.
- TPA-004 (API /itinerary) — Dev-BE [M], Dev-FE [S], QA [S]; deps: 002.
- TPA-003 (Generation) — Dev-BE [M], QA [S]; deps: 004.
- TPA-005 (Results) — Dev-FE [M], QA [S], Docs [S]; deps: 001/003/004.
- TPA-007 (Fallback) — Dev-BE [M], Dev-FE [S], QA [M]; deps: 004/003.
- TPA-006 (SLA) — Dev-FE/BE [M], QA [M]; deps: 007/005.
- TPA-008 (Errors) — Dev-FE [M], QA [M]; deps: 004.
- TPA-009 (Health/Obs) — Dev-BE [S], QA [S], Docs [S]; deps: none.

Immediate P0 fixes (from iteration status: red):
- T1 Dev-FE P0: `input[type=date]` not reflecting automated input; button disabled. Unify date fields as controlled strings (YYYY-MM-DD), update state on `onInput`/`onChange`. Centralize `isValid` for disabled state.
- T2 Dev-FE P0: Inline errors not rendering on blur/submit. Ensure wrapper forwards `onBlur` to native input; run sync validation; render persistent error container with `role=alert`.
- T3 Dev-FE P1: Cross-field validation `start<=end` with immediate error and disabled submit.

E2E skeletons (Playwright):
- AC-001: tests/e2e/ac.spec.ts (happy path UI + JSON summary). Also `tests/e2e/AC_happy_path.md`.
- TPA-001..009: skeletons/specs under `tests/e2e/TPA-*.e2e.md` and `.spec.ts`.

Failure handback rules:
- Spec mismatch: QA → PO/Planner with failing test id, repro steps, expected vs actual, logs/samples.
- Validation mismatch: QA → PO/Planner (cc Dev-FE/Dev-BE) with field, message, trigger timing, timing evidence.
- SLA/fallback misses: QA → Dev-FE/BE with timeline, ENV, metrics, HAR/screenshots.
- Health/obs gaps: QA → Dev-BE; escalate impact to PO/Planner.

Handoffs: Dev-FE/Dev-BE/QA/Docs own the items above in the order listed. E2E-first; do not mark Done until E2E green.