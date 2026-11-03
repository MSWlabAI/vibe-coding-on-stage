#!/usr/bin/env bash
# Put this folder back to the empty starting point after a practice run.
#   ./scripts/reset.sh            clean the folder (main, no build, no BRIEF.md)
#   ./scripts/reset.sh --deploy   also redeploy the empty page to the QR URL with vercel --prod
# Keeps node_modules and the .vercel link (both are gitignored, so git clean leaves them alone).
set -euo pipefail
cd "$(dirname "$0")/.."
git fetch -q origin main
git checkout -q main
git reset -q --hard origin/main
git clean -fdq
npm run check >/dev/null 2>&1 && echo "Folder reset: clean main, checks green." || { echo "Folder reset, but npm run check failed; run it to see why." >&2; exit 1; }
if [ "${1:-}" = "--deploy" ]; then vercel --prod; fi
