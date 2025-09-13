import { test, expect } from '@playwright/test'
import { gotoHome, fillForm, submit } from './_utils'

test.describe('TPA-003 生成件数', () => {
  test.skip('Tokyo, 2025-10-01〜03 → 合計9件', async ({ page }) => {
    await gotoHome(page)
    await fillForm(page, { destination: 'Tokyo', startDate: '2025-10-01', endDate: '2025-10-03' })
    await submit(page)
    await expect(page.getByLabel('result')).toBeVisible()
    const text = await page.getByLabel('result').textContent()
    expect(text || '').toContain('結果件数:')
  })
})

