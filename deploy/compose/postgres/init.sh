#!/usr/bin/env bash
# Runs once, on first start of an empty Postgres volume. Creates one database and one
# role per service with no cross grants (ADR-022). Passwords come from .env, never
# from this file. Later phases append their service to SERVICES.
set -euo pipefail

SERVICES=(character)

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<'SQL'
REVOKE CONNECT ON DATABASE postgres FROM PUBLIC;
REVOKE CONNECT ON DATABASE template1 FROM PUBLIC;
SQL

for svc in "${SERVICES[@]}"; do
  upper="$(echo "$svc" | tr '[:lower:]' '[:upper:]')"
  user_var="${upper}_DB_USER"; pass_var="${upper}_DB_PASSWORD"
  role="${!user_var:?$user_var is not set in .env}"
  password="${!pass_var:?$pass_var is not set in .env}"
  db="${svc}_db"

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
       -v role="$role" -v password="$password" -v db="$db" <<'SQL'
CREATE ROLE :"role" LOGIN PASSWORD :'password';
CREATE DATABASE :"db" OWNER :"role";
REVOKE CONNECT ON DATABASE :"db" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"db" TO :"role";
SQL
done
