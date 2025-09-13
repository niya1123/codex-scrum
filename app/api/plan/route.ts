import { NextRequest, NextResponse } from 'next/server'
import { deterministicPlanner } from '@/src/planner/adapters/deterministic'
import { inclusiveDaySpanUTC } from '@/src/planner/date'

function json(data: unknown, init?: number | ResponseInit) {
  return new NextResponse(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(typeof init === 'object' ? init?.headers : {}) }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const destination = String(body?.destination ?? '').trim()
    const start_date = String(body?.start_date ?? body?.startDate ?? '')
    const end_date = String(body?.end_date ?? body?.endDate ?? '')

    const reasons: { field: string; message: string }[] = []
    if (!destination) reasons.push({ field: 'destination', message: '行き先は必須です' })
    if (!start_date) reasons.push({ field: 'start_date', message: '開始日は必須です' })
    if (!end_date) reasons.push({ field: 'end_date', message: '終了日は必須です' })
    if (start_date && end_date && start_date > end_date) {
      reasons.push({ field: 'end_date', message: '終了日は開始日以降にしてください' })
    }
    if (start_date && end_date) {
      try {
        const diffDays = inclusiveDaySpanUTC(start_date, end_date)
        if (diffDays > 30) reasons.push({ field: 'end_date', message: '期間は30日以内にしてください' })
      } catch {
        reasons.push({ field: 'start_date', message: '日付形式が不正です' })
      }
    }

    if (reasons.length > 0) {
      return json({ error: 'VALIDATION_ERROR', reasons }, 400)
    }

    // 仮実装: 決定的に簡易旅程生成（3件/日）
    const planSnake = deterministicPlanner.generate({ destination, start_date, end_date })
    // Compatibility: return both snake_case (current UI) and camelCase (future contract)
    const planCamel = {
      destination: planSnake.destination,
      startDate: planSnake.start_date,
      endDate: planSnake.end_date,
      plan: planSnake.days.map((d) => ({
        date: d.date,
        suggestions: d.suggestions.map((s) => ({
          id: s.id,
          dayIndex: s.day_index,
          timeSlot: s.time_slot,
          title: s.title,
          description: s.description
        }))
      }))
    }
    return json({
      ...planSnake,
      ...planCamel
    }, 200)
  } catch (err) {
    return json({ error: 'UNKNOWN', message: 'unexpected error' }, 500)
  }
}
