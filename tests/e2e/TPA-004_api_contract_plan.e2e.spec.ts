import { test, expect } from '@playwright/test'

test.describe('TPA-004 API契約 (/api/plan)', () => {
  test('200 OK: 正常スキーマ', async ({ request }) => {
    const res = await request.post('/api/plan', {
      data: { destination: 'Kyoto', start_date: '2025-10-01', end_date: '2025-10-02' },
      headers: { 'content-type': 'application/json' }
    })

    expect(res.status()).toBe(200)
    const ctype = res.headers()['content-type'] || ''
    expect(ctype).toContain('application/json')

    const json = await res.json()
    expect(json.destination).toBe('Kyoto')
    expect(typeof json.startDate).toBe('string')
    expect(typeof json.endDate).toBe('string')

    // days または plan のいずれかが存在し、配列であること
    const hasDays = Array.isArray(json.days)
    const hasPlan = Array.isArray(json.plan)
    expect(hasDays || hasPlan).toBeTruthy()

    // 期間は2日なので、どちらかの配列は長さ2であること
    const len = hasPlan ? json.plan.length : (hasDays ? json.days.length : 0)
    expect(len).toBe(2)
  })

  test('400 Bad Request: バリデーション（必須未入力）', async ({ request }) => {
    const res = await request.post('/api/plan', {
      data: { destination: 'Kyoto' },
      headers: { 'content-type': 'application/json' }
    })

    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('VALIDATION_ERROR')
    expect(Array.isArray(json.reasons)).toBeTruthy()
    const fields = (json.reasons as Array<{ field: string }>).map(r => r.field)
    expect(fields).toEqual(expect.arrayContaining(['start_date', 'end_date']))
  })
})

