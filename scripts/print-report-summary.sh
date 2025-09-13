#!/usr/bin/env bash
set -euo pipefail
REPORT=${1:-out/playwright-report/index.html}
if [[ ! -f "$REPORT" ]]; then
  echo "NO_REPORT"; exit 1; fi
# Extract test titles and statuses from the report html
# This is a heuristic: look for JSON blobs or data-status attributes
grep -Eo 'data-status=\"[a-z]+\"|>T[123][^<]*<' "$REPORT" | sed 's/^.*data-status=\"/STATUS=/; s/\"$//; s/^>//; s/<$//' | paste - - - - 2>/dev/null || true
