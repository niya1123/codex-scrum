# TPA-004 API: POST `/api/itinerary` 契約

- 担当: Dev-BE, QA, Docs
- 目的: 200/400のスキーマ検証。常に `application/json`

## 前提
- Request JSON: `{ destination, start_date, end_date }`

## 操作
1) 正常: 上記の正常入力でPOST
2) 400: `{ destination: "", start_date: "", end_date: "" }` でPOST

## 期待結果
- 200: `{ destination, start_date, end_date, days:[{ date, suggestions:[{ id, time_slot, title, description }×3] }×N] }`
- 400: `{ error: "VALIDATION_ERROR", reasons:[{ field, message }] }`
- `content-type` は常に `application/json`

