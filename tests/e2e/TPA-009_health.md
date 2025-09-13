# TPA-009 監視・ヘルスチェック

- 担当: Dev-BE, QA, Docs
- 目的: `/health` が200かつJSON `{ ok: true }`。構造化ログの項目確認

## 操作
1) `GET /health`
2) ログ（構造化）に `request_id, route, destination, days_count, latency_ms, fallback_used, status` が出力されることをサーバーログで確認（可能なら）

## 期待結果
- ステータス200、`content-type` に `application/json` を含む
- ボディ `{ ok: true }`

