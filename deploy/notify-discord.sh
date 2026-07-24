#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DISCORD_WEBHOOK_URL:-}" ]]; then
  echo "DISCORD_WEBHOOK_URL is not configured; skipping notification."
  exit 0
fi

status="${1:-FAILED}"
title="${2:-GitHub Actions failure}"
detail="${3:-The workflow did not complete successfully.}"
run_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-unknown}/actions/runs/${GITHUB_RUN_ID:-unknown}"
content="[TRI:READ][${status}] ${title}
${detail}
Repository: ${GITHUB_REPOSITORY:-unknown}
Workflow: ${GITHUB_WORKFLOW:-unknown}
Run: ${run_url}"

payload="$(jq -n --arg content "$content" '{content: $content}')"
curl --fail --silent --show-error \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "$DISCORD_WEBHOOK_URL"
