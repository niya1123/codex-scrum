import { test, expect } from '@playwright/test'

test.describe('TPA-004 API契約', () => {
  test.skip('POST /api/itinerary 正常/不正入力 200/400', async ({ request }) => {
    // 正常
    const ok = await request.post('/api/itinerary', {
      data: { destination: 'Tokyo', startDate: '2025-10-01', endDate: '2025-10-03' },
      headers: { 'content-type': 'application/json' }
    })
    expect(ok.status()).toBe(200)
    expect(ok.headers()['content-type']).toContain('application/json')

    // 不正
    const bad = await request.post('/api/itinerary', {
      data: { destination: '', startDate: '', endDate: '' },
      headers: { 'content-type': 'application/json' }
    })
    expect(bad.status()).toBe(400)
    expect(bad.headers()['content-type']).toContain('application/json')
  })
})

