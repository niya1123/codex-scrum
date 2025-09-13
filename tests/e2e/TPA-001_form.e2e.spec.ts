import { test, expect } from '@playwright/test'
import { gotoHome, fillForm } from './_utils'

test.describe('TPA-001 フォーム表示と入力', () => {
  test.skip('Homeでフォーム入力でき、送信活性', async ({ page }) => {
    await gotoHome(page)
    await fillForm(page, { destination: 'Tokyo', startDate: '2025-10-01', endDate: '2025-10-03' })
    await expect(page.getByRole('button', { name: '計画する' })).toBeEnabled()
  })
})

