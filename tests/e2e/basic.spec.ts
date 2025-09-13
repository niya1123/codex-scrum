import { test, expect } from '@playwright/test'

test('[AC:TPA-003] ホーム画面のフォームに入力し、APIが応答する @smoke', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '旅程プランナー（MVP）' })).toBeVisible()

  await page.getByLabel('行き先').fill('Tokyo')
  await page.getByLabel('開始日').fill('2025-10-01')
  await page.getByLabel('終了日').fill('2025-10-03')

  const promise = page.waitForResponse((res) => res.url().endsWith('/api/plan') && res.status() === 200)
  await page.getByRole('button', { name: '計画する' }).click()
  const res = await promise
  const json = await res.json()
  expect(json.destination).toBe('Tokyo')
  expect(Array.isArray(json.days)).toBeTruthy()

  await expect(page.getByText('結果件数: 9')).toBeVisible()
})
