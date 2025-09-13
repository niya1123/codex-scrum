# TPA-004 API: POST `/api/itinerary` 契約E2E雛形

テスト名: E2E-TPA-004-200 正常レスポンスのスキーマ検証

- 前提:
  - API が起動している。

- 操作:
  1) POST `/api/itinerary` に JSON `{destination:"Tokyo", start_date:"2025-10-01", end_date:"2025-10-03"}` を送信。

- 期待結果:
  - `Content-Type: application/json`。
  - 200 レスポンス with JSON: `{ destination, start_date, end_date, days: [ { date, suggestions: [ { id, time_slot, title, description } x3 ] } xN ] }`。
  - `N=3`（2025-10-01〜2025-10-03）。
  - 各 `suggestions` は 3 件固定、`time_slot` は `morning/afternoon/evening` のいずれか、`description` は 120 文字以内。

---

テスト名: E2E-TPA-004-400 バリデーションエラーのスキーマ検証

- 前提:
  - API が起動している。

- 操作:
  1) POST `/api/itinerary` に JSON `{destination:"Tokyo", start_date:"2025-10-10", end_date:"2025-10-05"}` を送信。

- 期待結果:
  - `Content-Type: application/json`。
  - 400 レスポンス with JSON: `{ error:"VALIDATION_ERROR", reasons:[ { field, message }+ ] }`。

- 補足:
  - TPA-007 フォールバック時は top-level に `source:"fallback"` が付与される（別テストで検証）。
