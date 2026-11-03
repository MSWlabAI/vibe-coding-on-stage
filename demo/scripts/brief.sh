#!/usr/bin/env bash
# Pull the audience-written brief from the console app into BRIEF.md.
# Usage: ./scripts/brief.sh https://your-console.vercel.app   (or set CONSOLE_URL)
set -euo pipefail
CONSOLE_URL="${1:-${CONSOLE_URL:-}}"
if [ -z "$CONSOLE_URL" ]; then
  echo "usage: $0 https://your-console.vercel.app   (or set CONSOLE_URL)" >&2
  exit 1
fi
curl -fsS --max-time 10 "${CONSOLE_URL%/}/api/brief" -o BRIEF.md
echo "--- BRIEF.md ---"
cat BRIEF.md
