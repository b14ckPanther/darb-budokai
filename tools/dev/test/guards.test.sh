#!/usr/bin/env bash
# Tests for the repo guards: the commit-msg hook and the no-emoji check.
# Run: tools/dev/test/guards.test.sh   (exits non-zero if any case fails)
set -u

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
HOOK="$ROOT/.githooks/commit-msg"
EMOJI="$ROOT/tools/dev/check-no-emoji.sh"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT

pass=0
fail=0

expect() { # expect <ok|fail> <description> <command...>
  local want="$1" desc="$2"; shift 2
  if "$@" >/dev/null 2>&1; then got=ok; else got=fail; fi
  if [[ "$got" == "$want" ]]; then
    pass=$((pass + 1)); echo "PASS  $desc"
  else
    fail=$((fail + 1)); echo "FAIL  $desc (wanted $want, got $got)"
  fi
}

msg() { local f="$SCRATCH/msg-$RANDOM"; printf '%s\n' "$1" > "$f"; echo "$f"; }

# --- commit-msg hook -------------------------------------------------------
expect ok   "hook accepts a plain message"           "$HOOK" "$(msg 'Add parent pom with Java 21 and Spring Boot BOM')"
expect fail "hook rejects a Co-Authored-By trailer"  "$HOOK" "$(msg $'Add pom\n\nCo-Authored-By: x <x@y.z>')"
expect fail "hook rejects lowercase co-authored"     "$HOOK" "$(msg 'co-authored by someone')"
expect fail "hook rejects the assistant name"        "$HOOK" "$(msg 'Update CLAUDE notes')"
expect fail "hook rejects the vendor name"           "$HOOK" "$(msg 'Thanks Anthropic')"
expect fail "hook rejects a generated-with footer"   "$HOOK" "$(msg 'Generated with some tool')"
expect ok   "hook ignores git comment lines"         "$HOOK" "$(msg $'Add hook\n# Please enter the commit message (claude)')"

# A real commit in a scratch repo wired to the hook must be refused.
REPO="$SCRATCH/repo"
git init -q -b main "$REPO"
git -C "$REPO" config user.name test && git -C "$REPO" config user.email test@example.com
git -C "$REPO" config core.hooksPath "$ROOT/.githooks"
expect fail "git commit with attribution is refused" git -C "$REPO" commit -q --allow-empty -m "Co-Authored-By: x"
expect ok   "git commit with a clean message passes" git -C "$REPO" commit -q --allow-empty -m "Add scratch commit"

# --- no-emoji check --------------------------------------------------------
printf 'Quest complete \xf0\x9f\x94\xa5\n' > "$SCRATCH/fire.txt"          # U+1F525
printf 'Sun \xe2\x98\x80 rises\n'          > "$SCRATCH/sun.txt"           # U+2600
printf 'Heart \xe2\x9d\xa4\xef\xb8\x8f\n'  > "$SCRATCH/heart.txt"         # U+2764 U+FE0F
printf 'Plain text, arrows \xe2\x86\x92 and \xe6\xad\xa6\n' > "$SCRATCH/clean.txt"  # U+2192, CJK
expect fail "emoji check flags a 4-byte emoji"       "$EMOJI" "$SCRATCH/fire.txt"
expect fail "emoji check flags a dingbat/symbol"     "$EMOJI" "$SCRATCH/sun.txt"
expect fail "emoji check flags a variation selector" "$EMOJI" "$SCRATCH/heart.txt"
expect ok   "emoji check allows arrows and CJK"      "$EMOJI" "$SCRATCH/clean.txt"
expect ok   "emoji check passes on the clean tree"   "$EMOJI"

echo "guards: $pass passed, $fail failed"
[[ $fail -eq 0 ]]
