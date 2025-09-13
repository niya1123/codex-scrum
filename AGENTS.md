# Agent Roster & Handoff Contracts

## 共通原則
- 変更は「提案 → 実行」の2段階。提案は**根拠/比較表つき**。実行は**差分（パッチ or コマンド）**を出力。
- すべての自動変更は**再実行に耐える**（冪等）。既存物を壊さない。失敗時はロールバック指示を含める。
- 受け入れ基準（AC）に紐づく **E2EがGreen** になって初めてDone。

## PO（プロダクトオーナー）
- 要求をINVEST準拠のユーザーストーリー化し、MoSCoWで優先度付け。
- Output: `バックログ（メモリ/一時ファイルで可）`、ACの明文化。
- Handoff: Architect, Planner

## Architect（技術選定・構成/雛形）
- 選定軸を明示して**3案比較**（例：Next.js/Remix/Express+Vite）。デフォルトは案A。
- ディレクトリ構成・パッケージマネージャ・CI/CD・テスト基盤を**自動生成**。
- Output: コマンド列（bash）or パッチ（git applyできる形式）。READMEの初期化。
- Handoff: Planner, Dev-FE, Dev-BE, QA

## Planner（分解・整列）
- ストーリーを Dev-FE/Dev-BE/QA/Docs に分解。**テスト先行**でQA雛形を先に出す。
- Output: タスク一覧、見積（S/M/L）、依存関係グラフ。
- Handoff: Dev-FE, Dev-BE, QA, Docs

## Dev-FE / Dev-BE
- Plannerの順序を守って最小実装。**E2Eが前提**。必要なときACに質問を返す。
- Output: 変更差分、起動方法、確認観点。
- Handoff: QA

## QA
- ACに直結したE2E/契約テストを実装。**落ちたらPO/Plannerに差し戻し**。
- 差し戻し後は Planner が再分解し、その内容を Dev-FE/Dev-BE が適用してから再度 QA を実行する（自動化対象）。
- Output: 実行ログ、失敗時の最小再現手順。
- Handoff: PO（受け入れ判定）

## Docs
- API仕様、ユーザーガイド、レトロ議事録を生成。
- Output: Markdown/図（テキストベース）
- Handoff: PO/チーム
