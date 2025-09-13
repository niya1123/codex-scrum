# Travel Planner MVP – Planner Backlog

Stack/tools (Architect): Next.js 14 (App Router, TS), Playwright for E2E, Prettier. API under `app/api`, health under `/health`.

## 1) タスク一覧（担当/見積/依存）
- TPA-001 フォーム（Must）
  - Dev-FE [S]（依存: なし）: アクセシブルな入力（`destination`, `start_date`, `end_date`）、`aria-*`、`label`、ボタン活性条件実装。
  - QA [S]（依存: FE）: E2E `TPA-001_form` で表示/入力/活性化を確認。
  - Docs [S]（依存: FE）: ラベル・入力仕様、キーボード操作説明を追記。

- TPA-002 即時バリデーション（Must）
  - Dev-FE [M]（依存: 001）: blur/submit時に100ms以内で理由付きエラー。逆転・30日超・未入力。エラー時はAPI呼び出し0回。
  - Dev-BE [S]（依存: 001）: 同一バリデーションのサーバ実装（400 reasons）。
  - QA [S]（依存: FE/BE）: `TPA-002_validation` でエラーメッセージとネットワーク呼び出し0回を検証。

- TPA-004 API: POST `/api/itinerary`（Must）
  - Dev-BE [M]（依存: 002）: JSON入力/出力(200/400)。`/api/itinerary` を正とし、`/api/plan`は互換エイリアス維持。常に application/json。
  - Dev-FE [S]（依存: BE）: フロントの呼び出し先を`/api/itinerary`へ（互換期間は任意）。
  - QA [S]（依存: BE）: `TPA-004_api_contract` で正常/400のスキーマ検証。

- TPA-003 日別の簡易旅程生成（Must）
  - Dev-BE [M]（依存: 004）: 3件/日（朝/昼/夕）、決定的生成、未知行き先テンプレート。
  - QA [S]（依存: BE）: `TPA-003_generation` で Tokyo 2025-10-01〜03 → 合計9件。

- TPA-005 結果表示（Must）
  - Dev-FE [M]（依存: 001/003/004）: 日見出し配下に3カード（朝→昼→夕）。再検索可能。
  - QA [S]（依存: FE/BE）: `TPA-005_result_display` で件数と順序。
  - Docs [S]（依存: FE）: UIスクリーンショットと説明。

- TPA-007 タイムアウト&フォールバック（Must）
  - Dev-BE [M]（依存: 004/003）: 内部タイムアウト=2.5s(ENV可変)。タイムアウト時に`source:"fallback"`で200を返却。
  - Dev-FE [S]（依存: BE）: 通常UIで表示（任意で「プレビュー」バッジ）。
  - QA [M]（依存: FE/BE）: `TPA-007_fallback` で `DELAY_MS=5000` でも3秒以内描画かつ `source=="fallback"`。

- TPA-006 SLA: 3秒以内（Must）
  - Dev-FE/BE [M]（依存: 007/005）: クリック→初回描画≤3.0s。遅延時はダミー初期結果を3秒以内に提示。
  - QA [M]（依存: FE/BE）: `TPA-006_sla` で計測と閾値検証。

- TPA-008 エラーハンドリング（Must）
  - Dev-FE [M]（依存: 004）: 5xx/ネットワーク失敗は1000ms以内に「取得に失敗しました。再試行してください。」。Retryは同一リクエスト再送、400 reasonsをフォームへマッピングし入力保持。
  - QA [M]（依存: FE/BE）: `TPA-008_error_handling` で500擬似→表示→再試行成功を検証。

- TPA-009 監視・ヘルス（Should）
  - Dev-BE [S]（依存: なし）: 構造化ログ（request_id, route, destination, days_count, latency_ms, fallback_used, status）。`GET /health`。
  - QA [S]（依存: BE）: `TPA-009_health` で200かつJSON検証。
  - Docs [S]（依存: BE）: 運用ガイド（ENV/ログ項目/SLA観測方法）。

## 2) 依存関係/実装順（クリティカルパス）
- Must順: 001 → 002 → 004 → 003 → 005 → 007 → 006 → 008（並行可: 009）
- クリティカルパス: 001→002→004→003→005→007→006→008。

## 3) E2E 雛形（Playwright）
- tests/e2e/TPA-001_form.e2e.spec.ts
  - 前提: `/`表示。
  - 操作: 各フィールド入力。
  - 期待: ボタン活性、ARIA属性。
- tests/e2e/TPA-002_validation.e2e.spec.ts
  - 前提: `/`表示。
  - 操作: start>end 入力→blur。
  - 期待: エラー文言、API呼び出し0回。
- tests/e2e/TPA-004_api_contract.e2e.spec.ts
  - 前提: `POST /api/itinerary`。
  - 操作: 正常/不正入力送信。
  - 期待: 200/400、content-type JSON、スキーマ項目存在。
- tests/e2e/TPA-003_generation.e2e.spec.ts
  - 前提: Tokyo, 2025-10-01〜03。
  - 操作: 送信。
  - 期待: 合計9件（3日×3）。
- tests/e2e/TPA-005_result_display.e2e.spec.ts
  - 前提: 3日入力で結果描画。
  - 操作: DOM検証。
  - 期待: 日見出し配下に3カード、朝→昼→夕。
- tests/e2e/TPA-007_fallback.e2e.spec.ts
  - 前提: ENVでBE遅延5s。
  - 操作: 送信。
  - 期待: 3s以内に描画、`source:"fallback"` を検出。
- tests/e2e/TPA-006_sla.e2e.spec.ts
  - 前提: 遅延有効。
  - 操作: クリック→計測。
  - 期待: 初回描画≤3.0s。
- tests/e2e/TPA-008_error_handling.e2e.spec.ts
  - 前提: 500/ネットワーク失敗をモック。
  - 操作: 送信→エラー→再試行。
  - 期待: 1000ms以内にメッセージ、再試行で成功、入力保持。
- tests/e2e/TPA-009_health.e2e.spec.ts
  - 前提: サーバ起動。
  - 操作: `GET /health`。
  - 期待: 200 `{ok:true}`。
- tests/e2e/ac.spec.ts（先行AC）
  - 前提: `/`表示。
  - 操作: 行き先/日付入力→送信。
  - 期待: 結果DOM表示、API JSONに`days`または`plan`が含有（最初のACはここがGreen）。

## 4) 失敗時の差し戻しルール
- E2E/契約テスト失敗（仕様不一致）: QA→PO/Plannerへ差し戻し（失敗テスト名、再現手順、期待/実際の差分、ログ/レスポンス(JSON) 添付）。
- バリデーション仕様齟齬: QA→PO/Planner、Dev-FE/Dev-BE CC（対象フィールド、文言、タイミング、計測結果）。
- SLA超過/フォールバック不備: QA→Dev-BE/Dev-FE（計測値、環境変数、タイムライン、スクリーンショット/HAR）。
- 監視/ヘルス不備: QA→Dev-BE（レスポンス/ログ例）、PO/Plannerに影響評価を共有。

## 備考
- 既存の Playwright スケルトンは `test.skip` でコミット済み。先行AC（`ac.spec.ts`）はGreen目標。
- 並行実装: 009は独立で早期導入推奨（ヘルス/観測）。