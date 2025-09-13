# Travel Planner MVP – Planner Backlog

本書は Planner の分解成果物（タスク一覧、E2E雛形、依存/順序、差し戻しルール）です。

## スタック/ツール（Architect 決定）
- フレームワーク: Next.js 14（App Router, TypeScript）
- テスト: Playwright（E2E、MCPサーバー優先）
- 整形: Prettier
- API: `app/api` 配下、ヘルス: `GET /health`
- サンプル: APIの実例JSON/ヘッダは `docs/samples/api/` に配置

## 1) タスク一覧（担当/見積/依存）
- TPA-001 フォーム（Must）
  - Dev-FE [S]（依存: なし）: `destination`, `start_date`, `end_date` 入力。ラベル/ARIA。送信活性条件。
  - QA [S]（依存: FE）: `tests/e2e/TPA-001_form.e2e.spec.ts` で表示/入力/活性を検証。
  - Docs [S]（依存: FE）: 入力仕様とアクセシビリティ説明。

- TPA-002 即時バリデーション（Must）
  - Dev-FE [M]（依存: 001）: blur/submit 100ms以内で理由付き。逆転/30日超/未入力。エラー時 API 0回。
  - Dev-BE [S]（依存: 001）: サーバ側同等バリデーション（400 reasons）。
  - QA [S]（依存: FE/BE）: `tests/e2e/TPA-002_validation.e2e.spec.ts` で文言と呼び出し0回。

- TPA-004 API: POST `/api/itinerary`（Must）
  - Dev-BE [M]（依存: 002）: 200/400 JSON・常に `application/json`。`/api/plan` は互換エイリアスで維持。
  - Dev-FE [S]（依存: BE）: 呼び出し先を `/api/itinerary` に統一（移行期間は任意）。
  - QA [S]（依存: BE）: `tests/e2e/TPA-004_api_contract.e2e.spec.ts` で契約検証。

- TPA-003 日別の簡易旅程生成（Must）
  - Dev-BE [M]（依存: 004）: 各日3件（朝/昼/夕）決定的生成、未知行き先はテンプレート。
  - QA [S]（依存: BE）: `tests/e2e/TPA-003_generation.e2e.spec.ts` で 3日→9件。

- TPA-005 結果表示（Must）
  - Dev-FE [M]（依存: 001/003/004）: 日見出し配下に3カード（朝→昼→夕）、再検索可能。
  - QA [S]（依存: FE/BE）: `tests/e2e/TPA-005_result_display.e2e.spec.ts` で件数/順序。
  - Docs [S]（依存: FE）: 画面説明と操作ガイド。

- TPA-007 タイムアウト&フォールバック（Must）
  - Dev-BE [M]（依存: 004/003）: 内部タイムアウト=2.5s(ENV)。タイムアウト時 200 で `source:"fallback"`。
  - Dev-FE [S]（依存: BE）: 通常UI表示（任意「プレビュー」バッジ）。
  - QA [M]（依存: FE/BE）: `tests/e2e/TPA-007_fallback.e2e.spec.ts` で `DELAY_MS=5000`、3秒以内描画と `fallback`。

- TPA-006 SLA: 3秒以内（Must）
  - Dev-FE/BE [M]（依存: 007/005）: クリック→初回描画≤3.0s。遅延時はダミー初期結果を3秒以内提示。
  - QA [M]（依存: FE/BE）: `tests/e2e/TPA-006_sla.e2e.spec.ts` で計測/閾値。

- TPA-008 エラーハンドリング（Must）
  - Dev-FE [M]（依存: 004）: 5xx/ネットワーク失敗は1000ms以内に案内。Retryで同一リクエスト再送。400 reasonsをフォームへマップ、入力保持。
  - QA [M]（依存: FE/BE）: `tests/e2e/TPA-008_error_handling.e2e.spec.ts` で失敗→再試行成功。

- TPA-009 監視・ヘルス（Should）
  - Dev-BE [S]（依存: なし）: 構造化ログ（request_id, route, destination, days_count, latency_ms, fallback_used, status）。`GET /health`。
  - QA [S]（依存: BE）: `tests/e2e/TPA-009_health.e2e.spec.ts` で 200 `{ok:true}`。
  - Docs [S]（依存: BE）: 運用/監視ガイド（ENV/ログ項目/SLA観測）。

## 2) 依存関係/実装順（クリティカルパス）
- Must順: 001 → 002 → 004 → 003 → 005 → 007 → 006 → 008（009は独立）
- クリティカルパス: 001→002→004→003→005→007→006→008

## 3) E2E 雛形（Playwright / MCP優先、tests/e2e/* はフォールバックrunner）
- TPA-001: 前提 `/`、操作 入力、期待 ボタン活性/ARIA。
- TPA-002: 前提 `/`、操作 start>end+blur、期待 エラー文言/ネットワーク0回。
- TPA-004: 前提 `POST /api/itinerary`、操作 正常/不正、期待 200/400 & JSON。
- TPA-003: 前提 Tokyo 2025-10-01〜03、操作 送信、期待 合計9件。
- TPA-005: 前提 3日入力、操作 DOM検証、期待 朝→昼→夕の順で3カード。
- TPA-007: 前提 `DELAY_MS=5000`、操作 送信、期待 ≤3.0s描画 & `source:"fallback"`。
- TPA-006: 前提 遅延有効、操作 クリック計測、期待 初回描画≤3.0s。
- TPA-008: 前提 500/ネットワーク失敗モック、操作 送信→エラー→再試行、期待 1000ms以内メッセージ→成功、入力保持。
- TPA-009: 前提 サーバ起動、操作 GET /health、期待 200 `{ok:true}`。
- 先行AC（最優先Green）: 行き先/日付入力→旅程JSON表示（`tests/e2e/ac.spec.ts`）。

## 4) 失敗時の差し戻しルール
- 仕様不一致: QA→PO/Planner（失敗テスト名、再現手順、期待/実際差分、ログ/レスポンス添付）。
- バリデーション齟齬: QA→PO/Planner、Dev-FE/Dev-BE CC（対象フィールド、文言、発火タイミング、計測結果）。
- SLA/フォールバック: QA→Dev-BE/Dev-FE（計測値、ENV、タイムライン、スクショ/HAR）。
- 監視/ヘルス: QA→Dev-BE（レスポンス/ログ例）→PO/Plannerへ影響共有。

---
備考: 既存の Playwright スケルトンは `test.skip` で用意済み。`ac.spec.ts` は最初のACとしてGreenを狙います。
