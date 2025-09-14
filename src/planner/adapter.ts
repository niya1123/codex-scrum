import type { Planner } from './types'
import { deterministicPlanner } from './adapters/deterministic'

// Simple adapter switch for future LLM integration.
// Select via env var `PLANNER_ADAPTER` or `NEXT_PUBLIC_PLANNER_ADAPTER`.
// Supported values: 'deterministic' (default), future: 'llm'.
export function getPlanner(): Planner {
  const name = (process.env.PLANNER_ADAPTER || process.env.NEXT_PUBLIC_PLANNER_ADAPTER || 'deterministic').toLowerCase()
  switch (name) {
    case 'deterministic':
    default:
      return deterministicPlanner
  }
}

