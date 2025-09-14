"use client"
import { useCallback, useMemo, useState } from 'react'
import { inclusiveDaySpanUTC } from '@/src/planner/date'

type PlanResponse = {
  destination: string
  start_date: string
  end_date: string
  days?: { date: string; suggestions: { id: string; time_slot: string; title: string; description: string }[] }[]
  error?: string
  reasons?: { field: string; message: string }[]
}

export default function HomePage() {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlanResponse | null>(null)

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!destination.trim()) e.destination = '行き先は必須です'
    if (!startDate) e.start_date = '開始日は必須です'
    if (!endDate) e.end_date = '終了日は必須です'
    if (startDate && endDate && startDate > endDate) e.end_date = '終了日は開始日以降にしてください'
    // 期間>30日（UTC厳密判定）
    if (startDate && endDate) {
      try {
        const diffDays = inclusiveDaySpanUTC(startDate, endDate)
        if (diffDays > 30) e.end_date = '期間は30日以内にしてください'
      } catch {
        // パース不能時は開始日にエラー（BEと整合）
        e.start_date = '日付形式が不正です'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [destination, startDate, endDate])

  const canSubmit = useMemo(() => {
    return destination.trim() !== '' && startDate !== '' && endDate !== '' && startDate <= endDate
  }, [destination, startDate, endDate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 即時バリデーション（100ms以内）
    const ok = validate()
    if (!ok) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, start_date: startDate, end_date: endDate })
      })
      const json: PlanResponse = await res.json()
      setResult(json)
    } catch (err) {
      setResult({ destination, start_date: startDate, end_date: endDate, error: 'NETWORK_ERROR' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>旅程プランナー（MVP）</h1>
      <form aria-label="trip-form" onSubmit={onSubmit} className="form">
        <div className="field">
          <label htmlFor="destination">行き先</label>
          <input
            id="destination"
            name="destination"
            aria-invalid={!!errors.destination}
            aria-describedby="destination-error"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onInput={(e) => setDestination((e.target as HTMLInputElement).value)}
            onBlur={validate}
            placeholder="例: Tokyo"
            required
          />
          <div id="destination-error" role="alert" aria-live="polite" data-testid="destination-error" className="error">
            {errors.destination ?? ''}
          </div>
        </div>
        <div className="field">
          <label htmlFor="start_date">開始日</label>
          <input
            id="start_date"
            name="start_date"
            aria-invalid={!!errors.start_date}
            aria-describedby="start-date-error"
            type="text"
            placeholder="YYYY-MM-DD"
            inputMode="numeric"
            pattern="^\\d{4}-\\d{2}-\\d{2}$"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onInput={(e) => setStartDate((e.target as HTMLInputElement).value)}
            onBlur={validate}
            required
          />
          <div id="start-date-error" role="alert" aria-live="polite" data-testid="start-date-error" className="error">
            {errors.start_date ?? ''}
          </div>
        </div>
        <div className="field">
          <label htmlFor="end_date">終了日</label>
          <input
            id="end_date"
            name="end_date"
            aria-invalid={!!errors.end_date}
            aria-describedby="end-date-error"
            type="text"
            placeholder="YYYY-MM-DD"
            inputMode="numeric"
            pattern="^\\d{4}-\\d{2}-\\d{2}$"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onInput={(e) => setEndDate((e.target as HTMLInputElement).value)}
            onBlur={validate}
            required
          />
          <div id="end-date-error" role="alert" aria-live="polite" data-testid="end-date-error" className="error">
            {errors.end_date ?? ''}
          </div>
        </div>
        <button type="submit" disabled={!canSubmit || loading} aria-disabled={!canSubmit || loading}>
          {loading ? '検索中…' : '計画する'}
        </button>
      </form>

      {result && (
        <section aria-label="result" className="result">
          {result.error ? (
            <p>エラー: {result.error}</p>
          ) : result.days ? (
            <>
              <p>
                行き先: <strong>{result.destination}</strong> / 期間: {result.start_date} 〜 {result.end_date}
              </p>
              <p>
                結果件数: <strong>{result.days.reduce((acc, d) => acc + d.suggestions.length, 0)}</strong>
              </p>
            </>
          ) : (
            <p>結果を受信しました。</p>
          )}
        </section>
      )}
    </div>
  )
}
