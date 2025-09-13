# Travel Planner MVP Backlog (Planner)

## タスク一覧（担当/見積/依存）

- TPA-001 トリップ入力フォーム
  - Dev-FE: フォーム（destination/start_date/end_date）、カレンダー+直入力、ラベル/aria、送信可否制御（S→M） 依存: なし
  - QA: 画面表示と入力操作E2E（tests/e2e/TPA-001_form.e2e.md）実装（S） 依存: Dev-FE UI
  - Docs: 入力仕様/アクセシビリティガイド（S）依存: なし

- TPA-002 即時バリデーション
  - Dev-FE: blur/submitで即時エラー（理由付き）、表示100ms以内、invalid時にAPI呼び出し0回のガード（M）依存: TPA-001
  - QA: E2E（空dest/日付逆転/31日超、ネットワーク0回検証）tests/e2e/TPA-002_validation.e2e.md（M）依存: Dev-FE
  - Docs: バリデーションメッセージ一覧（S）依存: 仕様合意

- TPA-004 API: POST /api/itinerary
  - Dev-BE: エンドポイント実装、JSONバリデーション、200/400スキーマ、Content-Type固定、構造化ログ（M）依存: TPA-002（バリデーション）
  - QA: 契約E2E（200/400）tests/e2e/TPA-004_api_contract.e2e.md & サンプルJSONでスキーマ検証（M）依存: Dev-BE
  - Docs: API仕様とサンプル（docs/samples/api/*）整備（S）依存: Dev-BE合意

- TPA-003 日別の簡易旅程生成
  - Dev-BE: 決定的生成（3件/日, morning/afternoon/evening, description≤120字, 未知行き先テンプレ）(M) 依存: TPA-004骨格
  - QA: 決定性/件数E2E（Tokyo・3日=9件）tests/e2e/TPA-003_generation.e2e.md（S）依存: Dev-BE
  - Dev-FE: day_indexはFEで日配列indexから導出（S）依存: TPA-004応答

- TPA-005 結果表示画面
  - Dev-FE: 日見出し配下に3カード（time_slot順）、9カード、再検索対応（M）依存: TPA-003/004/001
  - QA: 件数と順序のE2E（tests/e2e/TPA-005_results_view.e2e.md）（M）依存: Dev-FE
  - Docs: UIガイド（S）依存: Dev-FE

- TPA-007 タイムアウト&フォールバック
  - Dev-BE: 内部タイムアウト=2.5s（env可変）、fallback生成・`source:"fallback"` で200返却（M）依存: TPA-004/003
  - Dev-FE: 通常UIで表示（任意でプレビューバッジ）（S）依存: Dev-BE
  - QA: DELAY_MS=5000でfallback確認＋3秒以内描画（tests/e2e/TPA-007_fallback.e2e.md）（M）依存: Dev-BE/FE

- TPA-6 SLA: 3秒以内に応答
  - Dev-FE: 初回描画までの計測点設置・ローディング/スケルトン（S）依存: TPA-005/007
  - QA: SLA E2E（クリック→初回描画 ≤ 3.0s）tests/e2e/TPA-006_sla.e2e.md（M）依存: Dev-FE/BE

- TPA-008 エラーハンドリング
  - Dev-FE: 5xx/ネットワーク失敗時1000ms以内のトースト/インライン、「再試行」で再送、400 reasons→フィールドマッピング・入力保持（M）依存: TPA-004/005
  - Dev-BE: 500擬似の注入スイッチ（テスト用フラグ/ルート）（S）依存: TPA-004
  - QA: 500擬似でメッセージと再試行成功、400マッピングE2E（tests/e2e/TPA-008_error_handling.e2e.md）（M）依存: Dev-FE/BE

- TPA-009 監視・ヘルス
  - Dev-BE: GET `/health` 200 `{ok:true}`、構造化ログ（request_id, route, destination, days_count, latency_ms, fallback_used, status）（S）依存: TPA-004
  - QA: `/health` 契約E2E（tests/e2e/TPA-009_health.e2e.md）（S）依存: Dev-BE
  - Docs: 運用/観測ガイド（S）依存: Dev-BE

サイズ目安: S≤0.5d, M≈1d, L≥2d

## 依存関係グラフ（主）
- TPA-001 → TPA-002 → TPA-004 → TPA-003 → TPA-005 → TPA-007 → TPA-006 → TPA-008
- TPA-009 は独立（早期実装推奨）
- TPA-004 は TPA-002 のバリデーション仕様に準拠
- 表示: TPA-005 は TPA-001/004/003 に依存

## 実装順序（クリティカルパス）
1) TPA-001 フォーム
2) TPA-002 即時バリデーション
3) TPA-004 API骨格 + 400/200 契約
4) TPA-003 旅程生成（決定的）
5) TPA-005 表示
6) TPA-007 タイムアウト+フォールバック
7) TPA-006 SLA実測
8) TPA-008 エラーハンドリング
（並行）TPA-009 ヘルス/ログ

## 差し戻しルール（失敗時）
- バリデーション文言/閾値相違: PO/Planner へ（期待文言・根拠・差分ログ）
- APIスキーマ不一致: Architect/Dev-BE へ（リクエスト/レスポンスJSON、HTTPログ、期待スキーマ）
- SLA超過: Dev-BE/Dev-FE へ（タイムライン計測ログ、DELAY_MS設定、描画時刻）
- Fallback欠落: Dev-BE へ（タイムアウト設定・ログ・実レスポンス）
- エラーハンドリングUI不整合: Dev-FE へ（DOMスナップショット、出力メッセージ、再試行結果）

## 補足/前提の明文化
- `day_index` は API では必須とせず、FE が `days` 配列indexから導出（TPA-003の決定性要件は維持）。
- Fallback 時は top-level `source:"fallback"` を付与（TPA-007）。契約テストは必須キーの妥当性を検証、余剰キーは許容。

## 生成物の配置
- テスト雛形: `tests/e2e/*.e2e.md`（runner非依存）
- APIサンプル: `docs/samples/api/*.example.json`
