import { test, expect } from '@playwright/test'
import { gotoHome, fillForm, submit } from './_utils'

// AC-001 行き先/日付入力→旅程JSON表示（最初のAC）
// NOTE: Skeleton test for happy path. Initially skipped until FE fixes land.
test.describe('AC-001 行き先/日付入力→旅程JSON表示', () => {
  test.skip('入力→送信で結果JSONの要約が表示される @ac', async ({ page }) => {
    await gotoHome(page)
    await fillForm(page, {
      destination: 'Tokyo',
      startDate: '2025-10-01',
      endDate: '2025-10-03'
    })

    await submit(page)

    // 結果セクションが現れること（UI契約）
    const result = page.getByRole('region', { name: 'result' })
    await expect(result).toBeVisible()

    // 結果件数（9）が表示されること（3日×3件）
    await expect(page.getByText('結果件数: 9')).toBeVisible()
  })
})

