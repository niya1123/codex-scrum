import { test, expect } from '@playwright/test'

test.describe('TPA-004 API契約 (/api/plan camelCase)', () => {
  test('200 OK: camelCase入力で正常スキーマ', async ({ request }) => {
    const res = await request.post('/api/plan', {
      data: { destination: 'Kyoto', startDate: '2025-10-01', endDate: '2025-10-02' },
      headers: { 'content-type': 'application/json' }
    })

    expect(res.status()).toBe(200)
    const ctype = res.headers()['content-type'] || ''
    expect(ctype).toContain('application/json')

    const json = await res.json()
    expect(json.destination).toBe('Kyoto')
    expect(typeof json.startDate).toBe('string')
    expect(typeof json.endDate).toBe('string')
    // camelCase優先: plan を優先検証（存在すれば2日ぶん）
    if (Array.isArray(json.plan)) {
      expect(json.plan.length).toBe(2)
    } else if (Array.isArray(json.days)) {
      expect(json.days.length).toBe(2)
    } else {
      throw new Error('plan/days が配列で存在しません')
    }
  })

  test('400 Bad Request: 逆転日付（end < start）', async ({ request }) => {
    const res = await request.post('/api/plan', {
      data: { destination: 'Kyoto', startDate: '2025-10-10', endDate: '2025-10-09' },
      headers: { 'content-type': 'application/json' }
    })

    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('VALIDATION_ERROR')
    const fields = (json.reasons as Array<{ field: string }>).map(r => r.field)
    expect(fields).toContain('end_date')
  })
})

