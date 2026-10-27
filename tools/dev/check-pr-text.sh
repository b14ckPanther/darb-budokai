#!/usr/bin/env bash
# Fails if a pull request's title or body carries attribution text or emoji.
# Reads PR_TITLE and PR_BODY from the environment (set by the CI guard job).
set -euo pipefail

pattern='co-authored|claude|anthropic|generated with'
text="$(mktemp)"; trap 'rm -f "$text"' EXIT
printf '%s\n%s\n' "${PR_TITLE:-}" "${PR_BODY:-}" > "$text"

status=0
if grep -qiE "$pattern" "$text"; then
  echo "check-pr-text: the PR title or body matches /$pattern/" >&2
  status=1
fi
if ! "$(dirname "$0")/check-no-emoji.sh" "$text" >/dev/null 2>&1; then
  echo "check-pr-text: the PR title or body contains emoji" >&2
  status=1
fi
exit $status
