export type PlannerInput = {
  destination: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

export type Suggestion = {
  id: string
  day_index: number
  time_slot: 'morning' | 'afternoon' | 'evening'
  title: string
  description: string
}

export type Plan = {
  destination: string
  start_date: string
  end_date: string
  days: { date: string; suggestions: Suggestion[] }[]
}

export interface Planner {
  generate(input: PlannerInput): Plan
}

