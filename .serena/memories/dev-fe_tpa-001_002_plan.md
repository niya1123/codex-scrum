Dev-FE plan: TPA-001/002 minimal UI
1) Align FE endpoint to /api/plan to satisfy current E2E waitForResponse.
2) Unify date validation with UTC utilities from src/planner/date.ts (>30 days, inclusive) to remove timezone flakiness.
3) Keep accessible form: label/aria-invalid/aria-describedby. Enable submit only when non-empty and start<=end. Immediate validation on blur.
4) Update README: build/start/test steps; clarify endpoint alias.
