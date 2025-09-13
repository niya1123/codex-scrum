# Travel Planner MVP E2E Skeletons (Runner-agnostic)

本ディレクトリは、Architect のテスト基盤（例: Playwright/Jest/Cypress 等）が確定するまでの「実行器非依存のE2E仕様雛形」を提供します。QA は本雛形をテストツールへ写経して実装します。

- 命名規約: `TPA-<ID>_*.e2e.md`
- 形式: 「テスト名 / 前提 / 操作 / 期待結果 / 計測・補足」
- 選定遵守: 実装時は Architect の選定ツールに合わせて移植してください。
- 時間計測: SLA 検証は「クリック→初回描画」までの経過時間を測定（高分解能タイマ）。
- セレクタ方針: `role/label` 優先、次点 `data-testid`。可用性を担保。

対応ユーザーストーリー: TPA-001〜TPA-009（依存順は PO/Planner 指定に準拠）。
