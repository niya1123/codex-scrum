import { test, expect } from '@playwright/test'

test.describe('TPA-009 ヘルス', () => {
  test.skip('GET /health 200 {ok:true}', async ({ request }) => {
    const res = await request.get('/health')
    expect(res.status()).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})

