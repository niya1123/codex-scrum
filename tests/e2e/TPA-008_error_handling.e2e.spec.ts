import { test, expect } from '@playwright/test'
import { gotoHome, fillForm, submit } from './_utils'

// Skeleton E2E for TPA-008
test.skip('TPA-008: 5xx/ネットワーク失敗時のメッセージ表示→再試行成功', async ({ page }) => {
  await gotoHome(page)
  // Note: fillForm expects startDate/endDate keys
  await fillForm(page, { destination: 'Tokyo', startDate: '2025-10-01', endDate: '2025-10-03' })

  // 実装時: 最初のAPIをabort/500にして、次回は成功に切り替えるroute mockを追加
  // 期待結果: 1000ms以内に「取得に失敗しました。再試行してください。」表示 → 再試行で成功
  await submit(page)
  // TODO: 実装時に上記検証を詳細化
  await expect(page.getByRole('region', { name: 'result' })).toBeVisible()
})
