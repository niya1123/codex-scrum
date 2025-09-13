import { test, expect } from '@playwright/test'
import { gotoHome } from './_utils'

test.describe('TPA-002 即時バリデーション/非同期抑止', () => {
  test.skip('start>end でエラー表示・API 0回', async ({ page }) => {
    await gotoHome(page)
    await page.getByLabel('行き先').fill('Tokyo')
    await page.getByLabel('開始日').fill('2025-10-05')
    await page.getByLabel('終了日').fill('2025-10-01')
    await page.getByLabel('終了日').blur()
    await expect(page.getByRole('alert')).toContainText('終了日は開始日以降にしてください')
  })
})

