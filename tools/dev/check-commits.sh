#!/usr/bin/env bash
# Checks every commit in a range: author and committer must be Nour, and no message
# may carry attribution text or emoji. Used by the CI guard job and before pushes.
# Usage: tools/dev/check-commits.sh [<rev-range>]   (default: all commits on HEAD)
set -euo pipefail

range="${1:-HEAD}"
expected="Nour Alden Mousa <nmcryptoinvest@gmail.com>"
pattern='co-authored|claude|anthropic|generated with'
status=0

while IFS=$'\t' read -r sha author committer; do
  if [[ "$author" != "$expected" || "$committer" != "$expected" ]]; then
    echo "check-commits: $sha author '$author', committer '$committer' (expected '$expected')" >&2
    status=1
  fi
done < <(git log --format=$'%h\t%an <%ae>\t%cn <%ce>' "$range")

msg_file="$(mktemp)"; trap 'rm -f "$msg_file"' EXIT
for sha in $(git rev-list "$range"); do
  git log -1 --format=%B "$sha" > "$msg_file"
  if grep -qiE "$pattern" "$msg_file"; then
    echo "check-commits: $sha message matches /$pattern/" >&2
    status=1
  fi
  if ! "$(dirname "$0")/check-no-emoji.sh" "$msg_file" >/dev/null 2>&1; then
    echo "check-commits: $sha message contains emoji" >&2
    status=1
  fi
done

exit $status
