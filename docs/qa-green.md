# QAをよりGreenにするための運用・実装ガイド

本リポジトリのE2Eは MCP-Playwright（Orchestrator経由）でのみ実行します。ローカルの Playwright CLI は使用しません。RED を減らして Green 率を高めるための運用をまとめます。

## 方針（SHIFT-LEFT + 安定化）
- 可観測性: 失敗時のトレース/スクショ/動画を自動保存（on-first-retry / only-on-failure / retain-on-failure）。
- 決定論: `TZ=UTC` 固定・`locale=ja-JP`・テストID（`data-testid`）対応。
- フレーク耐性: CI は `retries=2`、`workers=2`、`@flaky` は除外（隔離運用）。
- スコープ制御: 迅速な回帰検出用 `@smoke` セットを用意（pre-push で任意実行）。

## タグ運用ルール
- `@smoke`: クリティカルなハッピーパス。PR/ローカルで高速検証に使用。
- `@flaky`: 一時的に不安定なテスト。CI では自動的に除外（Playwright `grepInvert`）。
  - 付与時はテスト名末尾に `@flaky #ISSUE-123 原因メモ` の形式で根拠を残す。
  - 原因修正後にタグを外し、通常スイートへ復帰。

## 実行方法
- Orchestrator QA（MCP-Playwright）: `QA_REQUIRE_MCP=1 npm run orchestrate:qa`

出力は `out/test-results/` と（ローカル時）`out/playwright-report/` に保存されます。CI では `@flaky` は実行対象外です。

## MCP-Playwright の使用確認
- Orchestrator の QA ステージは、エージェントの最終出力に `runner=mcp`/`runner=fallback` が含まれる場合に検出し、`out/qa-runner.log` に記録します（あくまで記録用途）。
- 確認: `cat out/qa-runner.log`（例: `iter=1, runner=mcp, at=...`）

## フレークの最小化チェックリスト
- セレクタは原則 A11y（Role/Label） or `data-testid` を使用。`getByText` の過度使用を避ける。
- 時刻・日付依存は `timezoneId=UTC` 前提で記述。テスト時は固定値を使う。
- ネットワーク待機は `waitForResponse`/`toBeVisible` を併用し、`page.waitForTimeout` は避ける。
- テスト間で状態を共有しない（DB/ストレージ/メモリ）。

## pre-push について
ローカルの Playwright CLI を使用しない方針のため、pre-push でのローカルE2E実行は行いません。

## RED時の差し戻しテンプレ
1) 失敗ログ/トレースを確認（`out/test-results`）。
2) 再現: Orchestrator のログ・evidence を元に原因特定（ローカルCLIは使用しない）。
3) 恒久対応が難しければ一時的に `@flaky` を付与し、原因とIssue番号を併記。
4) Plannerへ原因/再現手順/暫定対応を添えて差し戻し。
