import { test, expect } from '@playwright/test'

test.describe('AC E2E', () => {
  test('T1 正常系: 京都 2025-10-01〜2025-10-02 → DOM表示とJSONにdays/plan含有', async ({ page, request }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '旅程プランナー（MVP）' })).toBeVisible()

    await page.getByLabel('行き先').fill('京都')
    await page.getByLabel('開始日').fill('2025-10-01')
    await page.getByLabel('終了日').fill('2025-10-02')

    await page.getByRole('button', { name: '計画する' }).click()
    await expect(page.getByLabel('result')).toBeVisible()
    // APIコントラクトも検証
    const res = await request.post('/api/plan', {
      data: { destination: '京都', start_date: '2025-10-01', end_date: '2025-10-02' },
      headers: { 'content-type': 'application/json' }
    })
    const json = await res.json()
    const hasDays = Array.isArray(json.days) && json.days.length >= 1
    const hasPlan = Array.isArray(json.plan) && json.plan.length >= 1
    expect(hasDays || hasPlan).toBeTruthy()
    await expect(page.getByLabel('result')).toBeVisible()
  })

  test('T2 バリデーション: 未入力でエラーメッセージ表示', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '旅程プランナー（MVP）' })).toBeVisible()

    // ボタンは非活性のまま
    await expect(page.getByRole('button', { name: '計画する' })).toBeDisabled()
    // blurで即時バリデーションを誘発
    await page.getByLabel('行き先').focus()
    await page.getByLabel('行き先').blur()
    await page.getByLabel('開始日').focus()
    await page.getByLabel('開始日').blur()
    await page.getByLabel('終了日').focus()
    await page.getByLabel('終了日').blur()
    // いずれかのエラーテキスト（role=alert）が表示されること
    await expect(page.getByRole('alert').first()).toBeVisible()
  })

  test('T3 逆転日付: 終了日 < 開始日 → エラーメッセージ', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('行き先').fill('Kyoto')
    await page.getByLabel('開始日').fill('2025-10-10')
    await page.getByLabel('終了日').fill('2025-10-09')
    // blur to trigger validation
    await page.getByLabel('終了日').blur()
    await expect(page.getByText('終了日は開始日以降にしてください')).toBeVisible()
  })
})
