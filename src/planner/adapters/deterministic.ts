import type { Plan, Planner, PlannerInput, Suggestion } from '../types'
import { iterateDateRangeUTC } from '../date'

function seedFrom(input: PlannerInput) {
  const s = `${input.destination}|${input.start_date}|${input.end_date}`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h >>> 0)
}

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = []
  let s = seed
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) % 0xffffffff
    const idx = s % arr.length
    out.push(arr[idx])
  }
  return out
}

const MORNING = ['朝の散歩', 'ローカルカフェ', 'サンライズスポット']
const AFTERNOON = ['美術館', 'ランチストリート', '街歩き']
const EVENING = ['サンセット', 'マーケット', 'ディナースポット']

function buildSuggestion(dest: string, dayIndex: number, slot: 'morning' | 'afternoon' | 'evening', titleSeed: string, i: number): Suggestion {
  const id = `${dayIndex}-${slot}-${i}`
  const title = `${dest}の${titleSeed}`
  const description = `${dest}で${slot === 'morning' ? '爽やかな朝' : slot === 'afternoon' ? 'ゆったり午後' : '夜景'}を楽しむスポット。`
  return { id, day_index: dayIndex, time_slot: slot, title, description }
}

class DeterministicPlanner implements Planner {
  generate(input: PlannerInput): Plan {
    const seed = seedFrom(input)
    const days = [] as Plan['days']
    let localSeed = seed
    for (const { ymd, index } of iterateDateRangeUTC(input.start_date, input.end_date)) {
      // pick titles deterministically
      const [m] = pick(MORNING, 1, (localSeed += 1))
      const [a] = pick(AFTERNOON, 1, (localSeed += 1))
      const [v] = pick(EVENING, 1, (localSeed += 1))
      const suggestions: Suggestion[] = [
        buildSuggestion(input.destination, index, 'morning', m, 1),
        buildSuggestion(input.destination, index, 'afternoon', a, 2),
        buildSuggestion(input.destination, index, 'evening', v, 3)
      ]
      days.push({ date: ymd, suggestions })
    }
    return { destination: input.destination, start_date: input.start_date, end_date: input.end_date, days }
  }
}

export const deterministicPlanner = new DeterministicPlanner()
