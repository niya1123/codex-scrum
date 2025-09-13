# TPA-003 日別の簡易旅程生成（3件/日）

- 担当: Dev-BE, QA
- 目的: 期間内の各日に `suggestions` 3件（朝/昼/夕）。決定的生成

## 前提
- API: `POST /api/itinerary`
- 入力: `{ destination, start_date, end_date }`

## 操作
1) `destination=Tokyo`, `start_date=2025-10-01`, `end_date=2025-10-03` を送信

## 期待結果
- days=3、合計9件（各日 `suggestions.length === 3`）
- `time_slot` は `morning` → `afternoon` → `evening` の順に表示
- 同一入力なら同一結果（決定的）

