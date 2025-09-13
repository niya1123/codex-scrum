# TPA-001 トリップ入力フォーム（E2E雛形）

テスト名: E2E-TPA-001-01 フォーム表示と各入力操作が可能

- 前提:
  - アプリが起動している（例: `http://localhost:3000/`）。
  - 画面にトリップ入力フォームが存在する。

- 操作:
  1) ルートに遷移する。
  2) `destination` テキスト入力に「Tokyo」を入力。
  3) `start_date` に `2025-10-01` を入力（カレンダーUIがあれば開閉確認、直接入力も許容）。
  4) `end_date` に `2025-10-03` を入力（同上）。

- 期待結果:
  - 各フィールドにラベルがあり、`aria-label` もしくは `for`/`id` が対応している。
  - すべて非空かつ `start_date ≤ end_date` の場合、送信ボタンが有効化される。
  - 入力値が保持される。

- 計測・補足:
  - セレクタは `getByRole('textbox', { name: /行き先|destination/i })` 等を想定。
  - `data-testid` を併用する場合は `destination-input`, `start-date`, `end-date`, `submit-button` を推奨。
