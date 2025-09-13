# TPA-009 監視・ヘルスチェック E2E雛形

テスト名: E2E-TPA-009-01 GET `/health` が200かつJSON

- 前提:
  - API が起動している。

- 操作:
  1) GET `/health` を実行。

- 期待結果:
  - ステータス 200。
  - `Content-Type: application/json`。
  - ボディ `{ ok: true }`。

- 補足:
  - 構造化ログの検証は別のレベル（集約/観測）で実施。
