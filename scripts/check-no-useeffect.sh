#!/usr/bin/env bash
# Fail if JS/TS source contains useEffect. Used locally and by CI on main.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

# Do not scan this script or GitHub workflow YAML — they mention the identifier.
# Only application source: js / jsx / ts / tsx.
excludes=(
  --exclude-dir=node_modules
  --exclude-dir=.next
  --exclude-dir=dist
  --exclude-dir=build
  --exclude-dir=coverage
  --exclude-dir=android
  --exclude-dir=ios
  --exclude-dir=playwright-report
  --exclude-dir=test-results
  --exclude-dir=.git
  --exclude-dir=.expo
  --exclude-dir=out
)

hits="$(
  grep -RInE --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx' \
    "${excludes[@]}" \
    --exclude='check-no-useeffect.sh' \
    -- '\buseEffect\b' . || true
)"

if [ -n "$hits" ]; then
  echo "$hits"
  echo "::error::useEffect is forbidden. CI fails; do not push to main with useEffect."
  exit 1
fi

echo "OK: no useEffect in JS/TS source."
