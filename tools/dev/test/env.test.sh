#!/usr/bin/env bash
# Tests for local secrets: tools/dev/gen-keys.sh and .env.example coverage.
set -u

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT
pass=0; fail=0
ok()  { pass=$((pass + 1)); echo "PASS  $1"; }
bad() { fail=$((fail + 1)); echo "FAIL  $1"; }
t()   { local d="$1"; shift; if "$@" >/dev/null 2>&1; then ok "$d"; else bad "$d"; fi; }

# gen-keys runs against a scratch copy so the real .env is never touched.
W="$SCRATCH/work"; mkdir -p "$W/tools/dev"
cp "$ROOT/.env.example" "$W/.env.example" 2>/dev/null
cp "$ROOT/tools/dev/gen-keys.sh" "$W/tools/dev/gen-keys.sh" 2>/dev/null

t "gen-keys creates .env"                     bash "$W/tools/dev/gen-keys.sh"
t ".env exists"                               test -f "$W/.env"
t "no placeholder left in .env"               bash -c "test -s '$W/.env' && ! grep -q '=__GENERATE__' '$W/.env'"
t ".env has every key from .env.example"      bash -c "test -s '$W/.env' && diff <(grep -oE '^[A-Z0-9_]+=' '$W/.env.example' | sort) <(grep -oE '^[A-Z0-9_]+=' '$W/.env' | sort)"
t ".env is readable by owner only"            bash -c "[[ \$(stat -f %Lp '$W/.env' 2>/dev/null || stat -c %a '$W/.env') == 600 ]]"
t "RS256 private key is a valid RSA key"      openssl rsa -check -noout -in "$W/secrets/jwt-private.pem"
t "public key matches private key"            bash -c "diff <(openssl rsa -in '$W/secrets/jwt-private.pem' -pubout 2>/dev/null) '$W/secrets/jwt-public.pem'"
first="$(grep '^POSTGRES_PASSWORD=' "$W/.env" 2>/dev/null)"
t "rerun without --force keeps .env"          bash "$W/tools/dev/gen-keys.sh"
t "existing secrets are unchanged"            test -n "$first" -a "$first" == "$(grep '^POSTGRES_PASSWORD=' "$W/.env" 2>/dev/null)"
t "rerun with --force regenerates secrets"    bash "$W/tools/dev/gen-keys.sh" --force
t "regenerated secret differs"                test "$first" != "$(grep '^POSTGRES_PASSWORD=' "$W/.env" 2>/dev/null)"
t "generated secrets are 32+ chars"           bash -c "grep -q '^POSTGRES_PASSWORD=' '$W/.env' && grep '^POSTGRES_PASSWORD=' '$W/.env' | awk -F= '{exit !(length(\$2) >= 32)}'"

# .env.example must list every variable the stack reads.
used="$(cat "$ROOT"/deploy/compose/*.yml "$ROOT"/services/*/src/main/resources/application*.yml 2>/dev/null \
        | grep -oE '\$\{[A-Z0-9_]+' | tr -d '${' | sort -u)"
missing=""
for v in $used; do grep -q "^$v=" "$ROOT/.env.example" 2>/dev/null || missing="$missing $v"; done
if [[ -n "$used" && -z "$missing" ]]; then ok ".env.example covers every variable in use"; else bad ".env.example is missing:${missing:- (no variables found)}"; fi
t ".env is git-ignored"                       git -C "$ROOT" check-ignore -q .env
t "secrets/ is git-ignored"                   git -C "$ROOT" check-ignore -q secrets/jwt-private.pem

echo "env: $pass passed, $fail failed"
[[ $fail -eq 0 ]]
