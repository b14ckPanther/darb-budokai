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
expect fail "hook rejects an emoji in the message"   "$HOOK" "$(msg $'Add streak flame \xf0\x9f\x94\xa5')"
expect ok   "hook ignores git comment lines"         "$HOOK" "$(msg $'Add hook\n# Please enter the commit message (claude)')"

# A real commit in a scratch repo wired to the hook must be refused.
REPO="$SCRATCH/repo"
git init -q -b main "$REPO"
git -C "$REPO" config user.name test && git -C "$REPO" config user.email test@example.com
git -C "$REPO" config core.hooksPath "$ROOT/.githooks"
expect fail "git commit with attribution is refused" git -C "$REPO" commit -q --allow-empty -m "Co-Authored-By: x"
expect ok   "git commit with a clean message passes" git -C "$REPO" commit -q --allow-empty -m "Add scratch commit"

# --- author and attribution check over a commit range (CI guard) -------------
AUTHORS="$ROOT/tools/dev/check-commits.sh"
H="$SCRATCH/history"
git init -q -b main "$H"
nour() { git -C "$H" -c user.name="Nour Alden Mousa" -c user.email="nmcryptoinvest@gmail.com" "$@"; }
nour commit -q --allow-empty -m "Base commit"
base="$(git -C "$H" rev-parse HEAD)"
nour commit -q --allow-empty -m "Add a clean step"
expect ok   "commit check passes Nour-only clean history"   bash -c "cd '$H' && '$AUTHORS' '$base..HEAD'"
git -C "$H" -c user.name="Someone Else" -c user.email="else@example.com" commit -q --allow-empty -m "Add a step"
expect fail "commit check rejects another author"           bash -c "cd '$H' && '$AUTHORS' '$base..HEAD'"
git -C "$H" reset -q --hard HEAD~1
GIT_COMMITTER_NAME="Bot" GIT_COMMITTER_EMAIL="bot@example.com" nour commit -q --allow-empty -m "Add a bot-committed step"
expect fail "commit check rejects another committer"        bash -c "cd '$H' && '$AUTHORS' '$base..HEAD'"
git -C "$H" reset -q --hard HEAD~1
nour commit -q --allow-empty --no-verify -m $'Add a step\n\nCo-Authored-By: x <x@y.z>'
expect fail "commit check rejects attribution in a message" bash -c "cd '$H' && '$AUTHORS' '$base..HEAD'"
git -C "$H" reset -q --hard HEAD~1
nour commit -q --allow-empty -m $'Add a step with an emoji \xf0\x9f\x94\xa5'
expect fail "commit check rejects emoji in a message"       bash -c "cd '$H' && '$AUTHORS' '$base..HEAD'"

# --- PR title and body check (CI guard) -------------------------------------
PRTEXT="$ROOT/tools/dev/check-pr-text.sh"
expect ok   "PR text check passes a clean description"   env PR_TITLE="Phase 0: bootstrap" PR_BODY="## What"$'\n'"Repo skeleton." "$PRTEXT"
expect fail "PR text check rejects a generated-with footer" env PR_TITLE="Phase 0" PR_BODY="Done."$'\n'"Generated with some tool" "$PRTEXT"
expect fail "PR text check rejects attribution in the title" env PR_TITLE="Co-Authored-By x" PR_BODY="" "$PRTEXT"
expect fail "PR text check rejects emoji in the body"      env PR_TITLE="Phase 0" PR_BODY=$'Ship it \xf0\x9f\x9a\x80' "$PRTEXT"

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
