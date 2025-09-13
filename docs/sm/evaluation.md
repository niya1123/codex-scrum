# Scrum Master 評価ガイド（このリポジトリ向け）

- 目的: 受け入れ基準（AC）に対するエビデンスを短時間で確認し、Done/差し戻しを判断する。
- 評価の原則: 「ACに紐づくE2EがGreen」かつ「最低限のアーティファクト（README/バックログ/CI）」が揃っていること。

## 評価フロー（10分版）
- PO: バックログ/ACの所在確認
  - `docs/backlog/travel-planner-mvp.md:12` にタスク/AC（TPA-***）が列挙されている。
  - 追加のACは `docs/acceptance/ac.yaml:1`（任意）に記載可能。
- Architect: 技術選定/雛形/CI
  - `README.md:11` の構成ポリシー、`.github/workflows/ci.yml:1` のCIを確認。
- Planner: 依存とE2E雛形
  - `docs/backlog/travel-planner-mvp.md:55` の依存順、`docs/backlog/travel-planner-mvp.md:59` のE2E雛形を確認。
- Dev-FE/BE: 最小実装/起動手順
  - `README.md:35` の起動/E2E手順を実行可能か軽く確認。
- QA: E2E結果（ACひも付け）
  - `npm run sm:eval:run` を実行し、ACカバレッジとGreen率を確認。

## 判定基準（例）
- MustなAC（TPA-***）に対して、対応テストが存在し Green ≥ 90% → 仮受入。
- 1件でもMust未カバー/Redがあれば差し戻し（`docs/backlog/...`に従い担当へ）。

## 補助ツール
- サマリ: `npm run sm:eval`（静的チェック）/ `npm run sm:eval:run`（E2E込み）
- 実行ログ/成果物の所在:
  - E2Eレポート: `out/playwright-report/`（ローカル）
  - E2E結果: `out/test-results/`
  - Orchestrator/その他ログ: `out/`

## 差し戻しテンプレート
- 失敗テスト: <テスト名>（ログ/スクショ添付）
- 対応AC: <TPA-***>
- 期待/実際: <簡潔に>
- 再現手順: <コマンド/入力値>
- 依頼先: PO/Planner/Dev-FE/Dev-BE/QA のいずれか

