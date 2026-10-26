#!/usr/bin/env bash
# Smoke test for the local infra: brings the Compose stack up, waits until every
# service is healthy, checks the per-service database and role, then stops it.
# Needs Docker and a .env (run tools/dev/gen-keys.sh once). Volumes are kept.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/deploy/compose/compose.yml" --profile tools)
TIMEOUT_SECONDS="${SMOKE_TIMEOUT_SECONDS:-180}"

[[ -f "$ROOT/deploy/compose/compose.yml" ]] || { echo "FAIL  deploy/compose/compose.yml is missing"; exit 1; }
[[ -f "$ROOT/.env" ]] || { echo "FAIL  .env is missing; run tools/dev/gen-keys.sh"; exit 1; }
set -a; source "$ROOT/.env"; set +a

cleanup() { "${COMPOSE[@]}" down >/dev/null 2>&1 || true; }
trap cleanup EXIT

"${COMPOSE[@]}" up -d --wait --wait-timeout "$TIMEOUT_SECONDS"

fail=0
check_named() { # check_named <description> <command...>
  local d="$1"; shift; if "$@" >/dev/null 2>&1; then echo "PASS  $d"; else echo "FAIL  $d"; fail=1; fi; }

for svc in postgres kafka rabbitmq kafka-ui; do
  state="$("${COMPOSE[@]}" ps --format '{{.Service}} {{.Health}}' | awk -v s="$svc" '$1==s {print $2}')"
  if [[ "$state" == "healthy" ]]; then echo "PASS  $svc is healthy"; else echo "FAIL  $svc is '$state'"; fail=1; fi
done

check_named "character_svc can connect to character_db" \
  "${COMPOSE[@]}" exec -T -e PGPASSWORD="$CHARACTER_DB_PASSWORD" postgres \
  psql -h localhost -U "$CHARACTER_DB_USER" -d character_db -tAc 'select 1'
check_named "character_svc cannot connect to the postgres admin db" \
  bash -c "! ${COMPOSE[*]} exec -T -e PGPASSWORD=\"$CHARACTER_DB_PASSWORD\" postgres psql -h localhost -U \"$CHARACTER_DB_USER\" -d postgres -tAc 'select 1'"
check_named "kafka lists topics" \
  "${COMPOSE[@]}" exec -T kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
check_named "rabbitmq answers diagnostics" \
  "${COMPOSE[@]}" exec -T rabbitmq rabbitmq-diagnostics -q ping

[[ $fail -eq 0 ]] && echo "compose smoke: all checks passed"
exit $fail
