# Scrum Runbook（1〜2日スプリントの実務手順）

> 本リポの `SCRUM.md:1` の合意を実行可能な手順に落とし込みました。AI/小規模チーム向けの短サイクルで回します。

## 役割とアウトプット（要約）
- PO: バックログ（INVEST, MoSCoW）+ AC（受け入れ基準）
- Architect: 技術選定/雛形/CI/テスト基盤（README更新）
- Planner: タスク分解（Dev-FE/Dev-BE/QA/Docs）+ 依存/見積 + QA雛形（先行）
- Dev-FE/Dev-BE: 最小実装 + 起動方法 + 確認観点（E2E前提）
- QA: AC直結のE2E/契約テスト + 失敗時の差し戻しレポート
- Docs: API仕様/ユーザーガイド/レトロ議事録

## 1日のサイクル（例）
- 09:30 企画（30分）
  - PO: MoSCoWで3件以内のMustを選ぶ（TPA-001/002/004等）
  - 出力: `docs/backlog/travel-planner-mvp.md` 更新 or Issue作成
- 10:00 設計（15分）
  - Architect: 変更の影響/雛形確認（README追記があれば更新）
- 10:15 計画（15分）
  - Planner: 依存/担当/見積を整列。QA雛形（`tests/e2e/*`) を `test.skip` で先出し
- 10:30〜 実装（FE/BE並行）
  - Dev: TPA順に最小実装。E2Eグリーンを目標
- 15:00 QA（30分）
  - QA: E2E実行。落ちたら差し戻しテンプレに従いPO/Plannerへ
- 16:00 レビュー（15分）
  - QAレポートを元にPOが受け入れ判定
- 16:20 レトロ（10分）
  - Docsが「続ける/やめる/試す」を記録

## DoR/DoD
- DoR（Ready）
  - ユーザーストーリーがINVEST準拠、MoSCoWでMust/Should明確
  - ACが明文化（`docs/backlog/*` または IssueにAC記載）
  - QA雛形（E2Eのスケルトン）がある
- DoD（Done）
  - ACに対応したE2EがGreen
  - README更新（起動/テスト方法）
  - 最小のデモ（スクショ or GIF）

## 実行コマンド（このリポ）
- ローカル起動: `npm install && npm run dev`
- E2E（ローカル）: `npx playwright install && npm run test:e2e`
- SMスコアカード: `npm run sm:eval`（静的）/ `npm run sm:eval:run`（E2E込み）
- Orchestrator（任意）: `npm run orchestrate[:po|:architect|:planner|:dev|:qa|:docs]`

## 差し戻しルール（要約）
- `docs/backlog/travel-planner-mvp.md:71` を参照。最低限:
  - 失敗テスト名 / 再現手順 / 期待と実際の差分 / ログ添付
  - 宛先（PO/Planner/Dev-FE/Dev-BE/QA）を明記

## 今日からの始め方（60分）
1) PO: Mustを3件以内に絞る（TPA-001/002/004 推奨）
2) Planner: 依存をクリティカルパスに並べる（001→002→004）
3) QA: 3件のE2E雛形を `tests/e2e/TPA-xxx_*.spec.ts` に配置（`test.skip`）
4) Dev: 001→002→004を最小実装。テスト名に `[AC:TPA-***]` を付与
5) SM: `npm run sm:eval:run` でACカバレッジ/Green率を確認→レビューへ

