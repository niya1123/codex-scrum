# Travel Planner MVP

最小構成の Next.js (App Router) プロジェクト。`/` に入力フォーム、`/api/plan` に仮応答API（最終名称 `/api/itinerary` へ統一予定。互換のエイリアス `/api/itinerary` を追加済み）。
将来のLLMベース旅程生成に差し替え可能な拡張点（`src/planner`）を用意しています。

## 構成ポリシー
- ランタイム: Node LTS (推奨: v20)
- フロント/サーバ: Next.js 14 (React 18, App Router)
- テスト: Playwright（E2E）
- CI: GitHub Actions（lintは省略、build + e2e）
- 拡張点: `src/planner` の `Planner` インターフェース/アダプタ
- ライセンス: MIT（`LICENSE`）

## ディレクトリ構成
```
.
├─ app/
│  ├─ api/plan/route.ts      # 仮の計画API（POST）
│  ├─ page.tsx               # 入力フォーム（/）
│  ├─ layout.tsx             # HTMLレイアウト
│  └─ globals.css            # スタイル
├─ docs/
│  └─ samples/
│     └─ api/                 # APIサンプル（レスポンス/ヘッダ等の実例）
├─ src/
│  └─ planner/
│     ├─ types.ts
│     └─ adapters/
│        └─ deterministic.ts # 決定的な簡易プランナー（3件/日）
├─ tests/e2e/
│  └─ basic.spec.ts          # 最小E2E
├─ out/
│  ├─ logs/                   # 実行時ログ（サーバ/テスト等）
│  └─ …                       # orchestrator生成物
├─ .github/workflows/ci.yml  # CI（Node 20でbuild+e2e）
├─ config/
│  └─ playwright.config.ts   # Playwright 設定（出力先は out/ 配下）
├─ package.json
├─ tsconfig.json
├─ next.config.mjs
├─ LICENSE
└─ README.md
```

## 起動
```
# 依存インストール
npm install

# 開発サーバ（http://localhost:3000）
npm run dev
```

## E2E（MCP-Playwright）

- 本リポはローカルの Playwright CLI を使用しません。E2E は Orchestrator の QA ステージ経由（MCP-Playwright）でのみ実行します。
- 実行:
```
npm run orchestrate:qa
```

出力先（Playwright）
```
- テスト結果: out/test-results/
- レポート: out/playwright-report/
```

安定運用や運用ルールは `docs/qa-green.md:1` を参照してください。

## 入力バリデーション（FE/BE共通）
- 必須: 行き先・開始日・終了日は未入力不可
- 逆転: `start_date <= end_date`（逆転時は終了日にエラー）
- 期間: 30日以内
- エラー時: 送信ボタンは非活性。FEはAPI未呼び出し（TPA-002の前提）。

## API 仕様（仮）
- エンドポイント: `POST /api/plan`
  - 互換エイリアス: `POST /api/itinerary`（同一レスポンス）
- Request: `application/json` `{ destination, start_date, end_date }`
- Response (200): `{ destination, start_date, end_date, days: [{ date, suggestions:[{ id, time_slot, title, description }×3] }×N] }`
- Response (400): `{ error: "VALIDATION_ERROR", reasons:[{ field, message }] }`
- すべて `application/json`

## ヘルスチェック
- `GET /health` → `200 { ok: true }`

## サンプル（API）
- 実例レスポンス/ヘッダは `docs/samples/api/` に配置（例: `api_plan_ok.body.json`, `api_plan_ok.headers`）。

## 拡張点: planner アダプタ
- インターフェース: `src/planner/types.ts`
- 既定実装: `src/planner/adapters/deterministic.ts`
- 将来、LLM実装（例: `adapters/llm.ts`）を追加し、APIから切り替え可能にします。

## ロールバック/クリーン
- 生成物を破棄する場合:
```
rm -rf node_modules .next playwright-report test-results
```
- 再実行性: `npm install` や `npm run build` は冪等。CI も同様に再実行可能です。

## 備考
- 本リポジトリにバックログを同梱したい場合は `docs/backlog/travel-planner-mvp.md` の追加を提案可能です。

## SM（スクラムマスター）向け
- 評価の手順とチェックリスト: `docs/sm/evaluation.md:1`
- 運用手順（Runbook）: `docs/scrum/runbook.md:1`
- スコアカード（静的）: `npm run sm:eval`
- スコアカード（E2E込み）: `npm run sm:eval:run`

## Orchestrator（自動化スクリプト）

- 実行: `npm run orchestrate`
- ステージ指定で再開: `npm run orchestrate:qa` など
- 進捗表示: `PROGRESS_STYLE=spinner`（bar|spinner|none）
- QAステージ: MCPサーバーのPlaywright（MCP-Playwright）を強制使用。最終サマリーに `runner=mcp` を含まない場合は不合格扱い（フォールバック runner は許容しない）。

### RED 調査 → 再分解（自動）
- QA が RED の場合、次イテレーションへ進む前に Investigator ステージが実行され、調査記録を `out/investigation-<iter>.yml` に保存します。
- Planner の再分解には、`backlog.yml` に加えて以下を自動で入力します。
  - 直近 QA 出力（`out/qa-<iter>.txt`）
  - 調査記録（`out/investigation-<iter>.yml` があれば）
- 環境変数でオン/オフ:
  - 有効（既定）: `ENABLE_RED_INVESTIGATION=1`
  - 無効: `ENABLE_RED_INVESTIGATION=0`

### トラブルシュート

- QA ステージで `STALL ... → SIGKILL` し、`Unexpected error: codex exited with code null` と出る
  - v修正: orchestrator 側でシグナル終了を許容し継続できるよう更新済み
  - 必要に応じてタイムアウトを調整
    - 全体: 環境変数 `CODEX_TIMEOUT_MS`（既定 30分）
    - 無出力: 環境変数 `CODEX_STALL_TIMEOUT_MS`（既定 5分）
  - 例（Zsh）:
    - `CODEX_STALL_TIMEOUT_MS=900000 npm run orchestrate:qa`

### 生成物とログの場所
- Orchestrator成果物/ログ: `out/`（JSONL/最終出力）
- 調査記録（RED 時）: `out/investigation-<iter>.yml`
- サーバ/テスト等のログ: `out/logs/`
