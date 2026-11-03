#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo 'Install Node.js 24 LTS first.' >&2; exit 1; }
[ "$(node -p 'process.versions.node.split(".")[0]')" = 24 ] || { echo 'Node.js 24 LTS is required.' >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo 'npm is missing; repair Node.js.' >&2; exit 1; }
[ -f node_modules/next/package.json ] || npm ci
npm run assets
npm run db:init
if [ "${1:-}" = '--production' ]; then
  npm run build
  exec npm run start
fi
exec npm run dev
