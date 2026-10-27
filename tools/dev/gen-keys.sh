#!/usr/bin/env bash
# Writes a local .env from .env.example with fresh random secrets, and an RS256
# key pair into secrets/. Both are git-ignored and never leave this machine.
# Usage: tools/dev/gen-keys.sh [--force]   (--force regenerates an existing .env and keys)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

env_file="$ROOT/.env"
secrets_dir="$ROOT/secrets"
umask 077

if [[ -f "$env_file" && "$FORCE" != true ]]; then
  echo "gen-keys: $env_file exists; keeping it (use --force to regenerate)."
else
  tmp="$(mktemp "$ROOT/.env.XXXXXX")"
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == *"=__GENERATE__" ]]; then
      echo "${line%%=*}=$(openssl rand -hex 32)"
    else
      echo "$line"
    fi
  done < "$ROOT/.env.example" > "$tmp"
  chmod 600 "$tmp"
  mv "$tmp" "$env_file"
  echo "gen-keys: wrote $env_file"
  if [[ "$FORCE" == true ]]; then
    echo "gen-keys: note: Postgres and RabbitMQ only read passwords when their volumes are empty." >&2
    echo "gen-keys: if the stack ran before, reset it: docker compose --env-file .env -f deploy/compose/compose.yml down -v" >&2
  fi
fi

mkdir -p "$secrets_dir"
if [[ -f "$secrets_dir/jwt-private.pem" && "$FORCE" != true ]]; then
  echo "gen-keys: JWT key pair exists; keeping it."
else
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out "$secrets_dir/jwt-private.pem" 2>/dev/null
  openssl rsa -in "$secrets_dir/jwt-private.pem" -pubout -out "$secrets_dir/jwt-public.pem" 2>/dev/null
  chmod 600 "$secrets_dir/jwt-private.pem"
  echo "gen-keys: wrote RS256 key pair to $secrets_dir"
fi
