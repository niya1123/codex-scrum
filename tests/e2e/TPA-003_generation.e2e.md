# TPA-003 日別の簡易旅程生成（3件/日）E2E雛形

テスト名: E2E-TPA-003-01 Tokyo・2025-10-01〜10-03で 3日×3件=9件

- 前提:
  - API `/api/itinerary` が TPA-004 契約どおり実装されている。

- 操作:
  1) POST `/api/itinerary` に `{destination:"Tokyo", start_date:"2025-10-01", end_date:"2025-10-03"}` を送信。
  2) 同一入力を 2 回送信し、決定的（同一結果）であることを比較。

- 期待結果:
  - `days.length === 3`。
  - 各日 `suggestions.length === 3`（朝/昼/夕）。
  - 合計 9 件。
  - 同一入力でレスポンスが完全一致（決定的生成）。
