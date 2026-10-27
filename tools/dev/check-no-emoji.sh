#!/usr/bin/env bash
# Fails if any emoji code point appears in the given files, or (no args) in the
# tracked text files of the repo plus the last commit message.
# Ranges: U+1F000-1FAFF, U+2600-27BF, U+2B50-2B55, U+FE0F, U+200D (ZWJ), U+20E3 (keycap).
set -euo pipefail

root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || pwd)"

scan() { # prints file:line:text for each hit; exit status 0 when a hit is found
  perl -CSD -ne '
    if (/[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B50}-\x{2B55}\x{FE0F}\x{200D}\x{20E3}]/) {
      print "$ARGV:$.: $_"; $hit = 1;
    }
    close ARGV if eof;
    END { exit($hit ? 0 : 1) }
  ' "$@"
}

if [[ $# -gt 0 ]]; then
  files=("$@")
else
  files=()
  while IFS= read -r -d '' f; do
    # text files only (skip images, fonts, binaries)
    if [[ -f "$root/$f" ]] && grep -Iq . "$root/$f" 2>/dev/null; then files+=("$root/$f"); fi
  done < <(git -C "$root" ls-files -z --cached --others --exclude-standard)
  if git -C "$root" rev-parse -q --verify HEAD >/dev/null; then
    last_msg="$(mktemp)"; trap 'rm -f "$last_msg"' EXIT
    git -C "$root" log -1 --format=%B > "$last_msg"
    files+=("$last_msg")
  fi
fi

[[ ${#files[@]} -eq 0 ]] && exit 0
if scan "${files[@]}"; then
  echo "check-no-emoji: emoji found (see above). Emojis are forbidden; use the SVG icon set." >&2
  exit 1
fi
