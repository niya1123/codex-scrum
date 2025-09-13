# AC-001 行き先/日付入力→旅程JSON表示（Happy Path）

- テストID: AC-001
- 対象US: TPA-001, TPA-003, TPA-004, TPA-005
- 優先度: Must（最初のAC）

## 前提
- アプリトップ `/` が起動している
- 入力フィールド: `行き先`（text）, `開始日`（date）, `終了日`（date）
- 送信ボタン: `計画する`
- API: `POST /api/itinerary`（互換のため `/api/plan` でも可）

## 操作
1) `/` を表示する
2) `行き先` に `Tokyo` を入力
3) `開始日` に `2025-10-01` を入力
4) `終了日` に `2025-10-03` を入力
5) `計画する` をクリック

## 期待結果
- `aria-label="result"` のセクションが表示される
- APIレスポンス（JSON）に以下が含まれる
  - `destination: "Tokyo"`
  - `start_date: "2025-10-01"`, `end_date: "2025-10-03"`
  - `days` は長さ3、各 `suggestions` は3件（合計9件）
- UI上に結果件数（9）が表示される

## 備考
- 実装初期は `/api/plan` を利用しても良いが、最終契約は `/api/itinerary` に揃える。

