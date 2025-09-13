# Travel Planner MVP Backlog (Planner)

## Stories (PO)
- TPA-001: フォーム入力 (Must)
- TPA-002: 即時バリデーション (Must)
- TPA-003: 簟易旅程生成 3件/日 (Must)
- TPA-004: API POST /api/itinerary (Must)
- TPA-005: 結果表示 (Must)
- TPA-006: SLA 3秒 (Must)
- TPA-007: タイムアウト&フォールバック (Must)
- TPA-008: エラーハンドリング (Must)
- TPA-009: 監視/ヘルス (Should, 独立)

## Tasks by Role (S/M/L)
- Dev-FE
  - TPA-001: アクセシブルなフォーム (S)
  - TPA-002: 即時バリデーション/エラー抑止でAPI 0回 (M)
  - TPA-005: 結果レンダリング（日別×3/並び順/再検索）(M)
  - TPA-006: 初回描画タイマー・ローディング/ダミー提示 (M)
  - TPA-007: フォールバック表示/プレビューバッジ (M)
  - TPA-008: 5xx/ネットワーク失敗の1s内トースト+再試行、400 reasonsマッピング (M)
- Dev-BE
  - TPA-004: `/api/itinerary` 契約整備（JSON常時/200/400）(M)
  - TPA-003: 決定的生成 3件/日・未知行き先テンプレ (M)
  - TPA-007: タイムアウト=2.5s & フォールバック(source:fallback) (M)
  - TPA-006: SLA支援（早期レス/ストリーミングorダミー）(M)
  - TPA-008: 500用テストスイッチ、標準エラーJSON (S)
  - TPA-009: 構造化ログ/`GET /health` (M)
- QA (E2E/契約)
  - AC-001: 行き先/日付→旅程JSON表示 Happy Path (S)
  - TPA-001: 入力操作・アクセシビリティ (S)
  - TPA-002: 即時バリデーション/ネットワーク0件/100ms (M)
  - TPA-004: 契約200/400/`content-type` (S)
  - TPA-003: Tokyo 10/01-03 → days=3/合計9件 (S)
  - TPA-005: 件数=9と順序 (S)
  - TPA-007: DELAY_MS=5000でも≤3.0s・`source==fallback` (M)
  - TPA-006: SLA計測≤3000ms (M)
  - TPA-008: 500擬似→1s内メッセージ/再試行成功、400 reasonsマッピング (M)
  - TPA-009: `/health` 200 JSON (S)
- Docs
  - TPA-004: API仕様(OAS雛形) (M)
  - TPA-001/005: 画面仕様/ラベル・aria (S)
  - TPA-009: 可観測性(ログ項目/計測法) (S)

## Dependencies (Graph)
- Must順: TPA-001 → TPA-002 → TPA-004 → TPA-003 → TPA-005 → TPA-007 → TPA-006 → TPA-008
- 表示連携: TPA-005 は TPA-001/004/003 に依存
- 監視: TPA-009 は独立（早期実装可）

## Critical Path (Implementation Order)
1) TPA-001 → 2) TPA-002 → 3) TPA-004 → 4) TPA-003 → 5) TPA-005 → 6) TPA-007 → 7) TPA-006 → 8) TPA-008 （TPA-009は並行）

## QA First (E2E Skeletons)
- 形式: Playwright既存spec + ヒューマンリーダブルMD（tests/e2e/*.md）
- AC-001 Happy Pathを最初にGreen化
- 契約サンプル: docs/samples/api/*.json を参照

## Rework Rules (差し戻し)
- 契約不一致/仕様齟齬: PO/Architectへ。提供物: 失敗テスト名、期待/実際のJSON、再現手順、関連ログ
- バリデーション/UI動作不一致: Dev-FEへ。提供物: スクリーンショット、DOM/role、期待/実際
- APIエラー/遅延: Dev-BEへ。提供物: request_id、遅延ms、fallback有無、ステータス、サンプルリクエスト/レスポンス
- ドキュメント不足: Docsへ。提供物: 不足箇所、参照すべきAC、スクリーンショットやログ

## Notes
- 現在 `/api/plan` 互換あり。最終契約は `/api/itinerary` に収斂する方針。
- すべてのE2Eは `tests/e2e/`、APIサンプルは `docs/samples/api/` に配置済み。