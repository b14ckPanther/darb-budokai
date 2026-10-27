# Architecture

Status: the service split, the brokers and the tech stack come from Nour's approved roadmap. Service names, topic names, ports, the choreography style and the contract format are **confirmed in Phase 1 (2026-10-27, under Nour's delegation; see `docs/specs/2026-10-27-phase-01-budokai-spec.md`)**.

## 1. Shape in one paragraph

Real events enter through **ingest-service** (HTTP from sibling projects, a poller for Darb Scouter, and the dev simulator). Ingest validates them against versioned JSON Schemas and publishes them to the Kafka topic `budokai.life-events.v1`. Domain services (**character**, **quest**, **inventory**, **spellbook**) each consume that stream, apply their own slice of the rulebook (config, not code), update their own database, and publish **effect events** to their own effect topic through a transactional outbox. **battlelog-service** consumes every effect topic and builds the day's timeline; a nightly RabbitMQ job compiles it into a replay script. **notification-service** pushes effects to the browser over STOMP. The Angular client talks to one public **GraphQL gateway** for queries and mutations and to notification-service for live updates. **identity-service** issues JWTs.

This is **choreography**, not orchestration: no central service tells others what to do. Each effect carries `causationId` (the life event that caused it) and `correlationId` (the day's chain), so the battle log can reconstruct "this event caused these effects".

## 2. Diagram

```
  Sibling projects (later)              Dev only
  Darb Scouter  Darb Juryoku            simulator
  Darb Sennin  Darb Kinton  Darb Kaio  Capsule            │
        │  HTTPS + HMAC        Darb Postgres │
        ▼                   (read-only poll) │
  ┌──────────────────────────────────────────▼───┐
  │ ingest-service :8082                          │  validate (JSON Schema), dedupe,
  │  POST /ingest/v1/events   DarbPoller (Rabbit) │  evidence check, quarantine
  └───────────────┬───────────────────────────────┘
                  │ Kafka  budokai.life-events.v1   (key = userId)
     ┌────────────┼──────────────┬───────────────┬──────────────────┐
     ▼            ▼              ▼               ▼                  │
 character-   quest-svc      spellbook-svc    inventory-svc         │
 svc :8083    :8084          :8086            :8085                 │
 stats, XP,   daily quests,  decks, cards,    loot rolls, items,    │
 stamina,     main quests,   SM-2, spells     equipment             │
 levels       raids, bosses                   (also consumes        │
     │            │              │             quest/character      │
     │            │              │             effects)             │
     ▼            ▼              ▼               ▼                  │
 budokai.character  budokai.quest   budokai.spellbook budokai.inventory     │
 .effects.v1      .effects.v1   .effects.v1     .effects.v1         │
     └────────────┴───────┬──────┴───────────────┘                  │
                          ▼                                         │
            ┌─────────────────────────────┐   ┌───────────────────────────┐
            │ battlelog-service :8087      │   │ notification-service :8088 │
            │ day timeline, nightly replay │   │ STOMP /ws  → browser       │
            └──────────────┬──────────────┘   └─────────────▲─────────────┘
                           │                                │
   RabbitMQ budokai.jobs ────┤ battlelog.compile-night        │ effects (Kafka)
   (direct exchange)       │ quest.generate-daily           │
                           │ quest.evaluate-missed-day      │
                           │ ingest.poll-darb               │
                                                            │
  ┌─────────────────────────────┐  JWKS  ┌────────────────────┐
  │ gateway-service :8080        │◄──────►│ identity-service    │
  │ Spring for GraphQL /graphql  │        │ :8081 login, JWT    │
  │ calls services over internal │        │ RS256, refresh,     │
  │ REST (HTTP interface clients)│        │ producer keys       │
  └──────────────▲──────────────┘        └────────────────────┘
                 │ GraphQL (HTTPS)               ▲
         ┌───────┴────────────────────────────────┴─┐
         │ budokai-web  Angular 19 + Three.js  :4200   │
         └───────────────────────────────────────────┘
  Postgres 17: one database per service (character_db, quest_db, ...)
```

## 3. Services

| Service | Port | Owns (database) | Consumes | Produces | Responsibility |
|---|---|---|---|---|---|
| `gateway-service` | 8080 | none (stateless) | internal REST of all services | GraphQL responses | Public GraphQL API (`/graphql`, GraphiQL in `local` only). JWT resource server. DataLoader batching, max depth 10 and complexity limits (values in config). Resilience4j timeouts and circuit breakers on downstream calls. |
| `identity-service` | 8081 | `identity_db`: users, refresh_tokens, producer_credentials | none | `identity.user.registered` (Kafka, optional) | Login, refresh-token rotation (httpOnly cookie), RS256 JWT issuing, `/.well-known/jwks.json`. Issues producer API keys and HMAC secrets for ingest. Service-to-service tokens (client credentials). |
| `ingest-service` | 8082 | `ingest_db`: received_events (idempotency), quarantine, producer_cursors | HTTP, RabbitMQ `ingest.poll-darb` | Kafka `budokai.life-events.v1`, `budokai.ingest.rejected.v1` | Single door for real-world events. Verifies HMAC + timestamp, validates the CloudEvents envelope and the JSON Schema for the `type` and version, dedupes by `id` and natural key, checks evidence and backdating window (config), normalises, publishes. Darb Scouter poller connector. |
| `character-service` | 8083 | `character_db`: characters, stat_values, stamina_ledger, xp_ledger, levels | `budokai.life-events.v1`, `budokai.quest.effects.v1`, `budokai.spellbook.effects.v1` | `budokai.character.effects.v1` | Stats (Vigor, Craft, Lore, Resolve), stamina pool, XP and level curve, skill-tree unlocks. Applies `character` rules from the rulebook. |
| `quest-service` | 8084 | `quest_db`: quest_templates (seeded from config), quests, quest_progress, main_quests, raids, bosses | `budokai.life-events.v1`, RabbitMQ `quest.generate-daily`, `quest.evaluate-missed-day` | `budokai.quest.effects.v1` | Quest Log (daily quests, habits), main quests from job applications, raids from interviews, boss fights from code reviews, final boss from offers, missed-day consequences. |
| `inventory-service` | 8085 | `inventory_db`: items (catalogue seeded from config), inventory_entries, equipment, loot_rolls | `budokai.quest.effects.v1`, `budokai.character.effects.v1` | `budokai.inventory.effects.v1` | Loot tables, deterministic loot rolls, equipment slots and the small modifiers items give. |
| `spellbook-service` | 8086 | `spellbook_db`: decks, cards, reviews, schedules, spells | `budokai.life-events.v1` (external study events), GraphQL-originated review commands via REST | `budokai.spellbook.effects.v1`, and `study.*` life events back through ingest's internal endpoint | Recall: decks, cards, SM-2 scheduling, review sessions. A card becomes a spell when first recalled correctly; mastery and fading follow its SM-2 state. |
| `battlelog-service` | 8087 | `battlelog_db`: day_timelines, timeline_entries, battle_logs (replay scripts) | all `budokai.*.effects.v1`, RabbitMQ `battlelog.compile-night` | `budokai.battlelog.effects.v1` (`battlelog.compiled`) | Builds each user's day timeline from effects (grouped by `causationId`). Nightly job compiles a deterministic replay script (JSON) plus narrated lines from copy templates in config. |
| `notification-service` | 8088 | none (or `notification_db` for unread markers, proposed) | all `budokai.*.effects.v1` | STOMP messages | STOMP over WebSocket at `/ws`. Authenticates the CONNECT frame with the JWT. Sends to `/user/queue/effects` and `/user/queue/battlelog`. |
| `simulator` (tools) | 8090 | none | scenario YAML | HTTP to ingest | Dev-only. Emits realistic events for a simulated persona. Refuses to start unless profile `sim` is active and `REALM_SIMULATOR_ENABLED=true`. |
| `budokai-web` | 4200 | none | GraphQL, STOMP | GraphQL mutations | Angular 19 client. |

Why the gateway calls services over REST instead of querying their databases: data ownership. No service reads another's tables. Why not GraphQL federation: one gateway with typed HTTP interface clients is simpler to run locally and still shows schema design; federation can come later (confirmed in Phase 1).

## 4. Kafka vs RabbitMQ

**Rule of thumb used in this repo:** Kafka carries **facts** (things that happened, which many consumers read and which we may replay). RabbitMQ carries **work** (a task that exactly one worker should do, with retries, delays and a dead-letter queue).

### Kafka topics (facts)

| Topic | Key | Partitions (local) | Retention | Producer | Consumers | Why Kafka |
|---|---|---|---|---|---|---|
| `budokai.life-events.v1` | userId | 3 | 30 days (config) | ingest-service | character, quest, spellbook, (Darb Enmacho later) | Many independent consumers, per-user ordering, replay to rebuild projections or re-run a day with a new rulebook version. |
| `budokai.character.effects.v1` | userId | 3 | 30 days | character-service | quest, inventory, battlelog, notification | Fan-out of state changes; ordered per user. |
| `budokai.quest.effects.v1` | userId | 3 | 30 days | quest-service | character, inventory, battlelog, notification | Same. |
| `budokai.inventory.effects.v1` | userId | 3 | 30 days | inventory-service | battlelog, notification | Same. |
| `budokai.spellbook.effects.v1` | userId | 3 | 30 days | spellbook-service | character, quest (spell bonus in boss fights), battlelog, notification | Same. |
| `budokai.battlelog.effects.v1` | userId | 1 | 30 days | battlelog-service | notification | Tells clients a replay is ready. |
| `budokai.ingest.rejected.v1` | producer | 1 | 7 days | ingest-service | none in Darb Budokai (ops visibility; Darb Genki later) | Audit trail of rejected events without blocking producers. |
| `<topic>.dlt` | same | same | 14 days | Spring Kafka `DeadLetterPublishingRecoverer` | humans | Poison messages after retries (`DefaultErrorHandler`, backoff from config). |

Kafka runs in KRaft mode (single broker locally, `apache/kafka` 4.x image). Topics are created by each producer's `NewTopic` beans with partition counts from config. Consumers use virtual threads (`spring.threads.virtual.enabled=true`) and manual offset commit after the inbox write.

### RabbitMQ queues (work)

Exchange `budokai.jobs` (direct), dead-letter exchange `budokai.jobs.dlx`, retry via per-queue TTL "wait" queues (delays from config).

| Queue (routing key) | Producer | Worker | Why RabbitMQ |
|---|---|---|---|
| `battlelog.compile-night` | battlelog-service scheduler (cron from config, per user timezone) | battlelog-service workers | One job per user per night; competing consumers; retry with backoff; DLQ if compile keeps failing. Does not need replay. |
| `quest.generate-daily` | quest-service scheduler at local day start | quest-service workers | Per-user task with acknowledgement; must happen exactly once per user per day (plus DB unique constraint). |
| `quest.evaluate-missed-day` | quest-service scheduler at local day end + grace | quest-service workers | Delayed work (grace period from config via TTL queue). |
| `ingest.poll-darb` | ingest-service scheduler (interval from config) | ingest-service workers | Periodic pull from Darb Scouter's Postgres; at most one in flight (single active consumer). |
| `notification.digest` (later, optional) | notification-service | notification-service | Batching non-urgent pushes. |

Schedulers use ShedLock on the owning service's database so that only one instance enqueues jobs when scaled.

## 5. Data ownership

- One PostgreSQL 17 server locally, **one logical database and one login role per service** (`character_db` / `character_svc`, and so on), created by `deploy/compose/postgres/init.sh` (passwords from `.env`, ADR-031). A service's role has no grants on another service's database. In Darb Genki these can become separate instances without code changes.
- Schema migrations: Flyway, `src/main/resources/db/migration/V<N>__<desc>.sql`, per service. `spring.jpa.hibernate.ddl-auto=validate`.
- Optimistic locking (`@Version`) on aggregates that receive concurrent updates (character, quest progress).
- Every row that belongs to a player has `user_id UUID NOT NULL`.

### Outbox and inbox (exactly-once effect, at-least-once delivery)

- **Outbox:** a service writes its state change and an `outbox_events` row in the same transaction. A relay (`@Scheduled`, interval from config, `SELECT ... FOR UPDATE SKIP LOCKED`) publishes to Kafka and marks rows sent. Shared implementation lives in `libs/budokai-platform`.
- **Inbox:** consumers insert the incoming event `id` into `processed_events` (primary key) in the same transaction as the state change. A duplicate insert means "already handled, ack and skip".
- Result: replays and redeliveries never double-award XP. This is tested with Testcontainers (publish the same event twice, assert one effect).

## 6. Event contracts and versioning

Details and every event: `EVENT_CONTRACTS.md`.

- **Envelope:** CloudEvents 1.0, structured JSON mode, plus Darb Budokai extensions (`budokaiuserid`, `budokaievidence`, `budokaimode`, `causationid`, `correlationid`, `rulebookversion` on effects).
- **Payload schema:** JSON Schema 2020-12, one file per type and major version: `contracts/events/<type>/v<N>.schema.json`, with valid and invalid examples in `contracts/events/<type>/examples/`.
- **Why JSON Schema over Avro** (confirmed in Phase 1): producers are polyglot (Python, Dart, TypeScript, a LangGraph agent); JSON is readable in Kafka UI; no Schema Registry to run locally. Avro + Schema Registry stays an option for Darb Genki. Recorded as ADR-016.
- **Versioning rules:**
  - Additive, optional fields: same major version. Consumers ignore unknown fields.
  - Removing or renaming a field, changing a type, or adding a required field: new major version (`v2.schema.json`), new `dataschema` URI. Topic names keep `.v1` until the envelope itself breaks.
  - Consumers support the current and previous major version of each type until every producer has moved.
  - `libs/budokai-contracts` has a test that loads each `vN` and `vN-1` and fails the build on a breaking change inside the same major version (compares required fields, types and enums).
- **Generation:** Java records for payloads are hand-written in `libs/budokai-contracts` and contract-tested against the schemas (every example must deserialise and round-trip). TypeScript types for the web client are generated from the GraphQL schema, not from event schemas.

## 7. Rulebook (config, not code)

- `config/rulebook/v1/*.yaml`: `character.yaml`, `quests.yaml`, `loot.yaml`, `spells.yaml`, `skill-tree.yaml`, `evidence.yaml`, `map.yaml`. Shape described in `GAME_DESIGN.md`.
- `config/copy/en/*.yaml`: user-facing changeable copy (battle-log lines, quest names, item names).
- `config/seed/demo/*.yaml`: demo persona, decks and history, loaded only with profile `demo`.
- `config/simulator/scenarios/*.yaml`: simulator scenarios.
- Loaded by `libs/budokai-rules-core` (`RulebookLoader`), validated against `config/rulebook/rulebook.schema.json` at startup (fail fast on bad config). Path from env `REALM_RULEBOOK_PATH`. Reload via `POST /internal/rulebook/reload` (service token) or on restart. Every effect stamps `rulebookversion` so the battle log and replays are reproducible.
- Content that the player edits (decks, cards, custom habits) lives in the database, not config.

## 8. Security

- identity-service signs access tokens (RS256, lifetime from config, default 15 min proposed) and rotates refresh tokens (httpOnly, `SameSite=Strict`, 14 days proposed).
- gateway-service and notification-service are OAuth2 resource servers using the JWKS URI.
- Internal REST between gateway and services requires a service token (client-credentials JWT from identity) and is only reachable on the internal Docker network.
- Ingest producers authenticate with `X-Budokai-Producer` (key id) and `X-Budokai-Signature: t=<unix>,v1=<hex HMAC-SHA256(secret, t + "." + body)>`. Requests older than the window in config (300 s proposed) are rejected to stop replays.
- CORS allowlist from env. GraphQL introspection disabled outside `local`.
- Rate limits on login and ingest (Bucket4j, limits in config).

## 9. Repository layout (created in Phase 0)

```
budokai/
├── pom.xml                         parent: Java 21, Spring Boot 3.5.x BOM, plugin management
├── mvnw, .mvn/
├── libs/
│   ├── budokai-contracts/            CloudEvents envelope, payload records, schema validator, compat tests
│   ├── budokai-rules-core/           rulebook model, loader, evaluator (pure Java, no Spring web)
│   ├── budokai-platform/             outbox relay, inbox, Kafka/Rabbit config, error handling, observability defaults
│   └── budokai-test-support/         Testcontainers base classes, fixtures builders, ArchUnit rules
├── services/
│   ├── gateway-service/   identity-service/   ingest-service/
│   ├── character-service/ quest-service/      inventory-service/
│   └── spellbook-service/ battlelog-service/  notification-service/
├── tools/simulator/
├── web/budokai-web/                  Angular 19 app
├── contracts/events/<type>/v1.schema.json + examples/
├── contracts/graphql/schema.graphqls   public schema (gateway serves it)
├── config/rulebook/v1/  config/copy/en/  config/seed/demo/  config/simulator/scenarios/
├── deploy/compose/compose.yml, compose.observability.yml, postgres/init.sh
├── tools/dev/gen-keys.sh
├── .github/workflows/ci.yml
├── .githooks/commit-msg
├── .env.example
└── docs/
```

Each service package root: `dev.zangeel.budokai.<service>` (see `CONVENTIONS.md`).

## 10. Local development with Docker Compose

`deploy/compose/compose.yml` (tags pinned in ADR-019; host ports in ADR-031, all overridable in `.env`):

| Container | Image | Ports | Notes |
|---|---|---|---|
| postgres | `postgres:17.11-alpine` | 54320 (host) | `init.sh` creates per-service DBs and roles |
| kafka | `apache/kafka:4.3.2` | 9092 | KRaft single node |
| kafka-ui | `kafbat/kafka-ui:v1.5.0` | 18090 | profile `tools` |
| rabbitmq | `rabbitmq:4.3.7-management-alpine` | 55672, 15672 | definitions file declares exchange, queues, DLX |
| services | built from each service's Dockerfile (or `spring-boot:build-image`) | 8080 to 8088 | profile `apps` |
| simulator | built | 8090 | profile `sim` |

Typical loop: `docker compose --env-file .env -f deploy/compose/compose.yml up -d` for infra, run the one service you are working on with `./mvnw ... spring-boot:run -Dspring-boot.run.profiles=local`, others in containers with `--profile apps`. Angular dev server proxies `/graphql` to 8080 and `/ws` to 8088 (`proxy.conf.json`).

Health: every service exposes `/actuator/health/liveness` and `/actuator/health/readiness`; compose healthchecks use them.

## 11. Observability hooks (for Darb Genki later)

Darb Budokai does not ship Kubernetes or dashboards. It makes them easy:

- Micrometer + Actuator on every service: `/actuator/prometheus`, `/actuator/health/{liveness,readiness}`, graceful shutdown.
- Tracing: `micrometer-tracing-bridge-otel` + OTLP exporter, endpoint from `MANAGEMENT_OTLP_TRACING_ENDPOINT`, sampling from config. Off by default.
- Observation enabled on Kafka templates/listeners and RabbitMQ templates/listeners, so one trace spans ingest → Kafka → domain service → effect → notification.
- Structured JSON logs (`logging.structured.format.console=ecs`) with `traceId`, `userId`, `eventId`.
- Business metrics: `budokai.events.ingested{type,producer,result}`, `budokai.effects.emitted{type}`, `budokai.battlelog.compile.duration`, `budokai.sm2.reviews{grade}`.
- `compose.observability.yml` adds `grafana/otel-lgtm` (one container: OTel collector, Prometheus, Tempo, Loki, Grafana) for local viewing.
- 12-factor config: everything environment-driven, no host paths baked in. Container images built with `./mvnw spring-boot:build-image` (Paketo) so Helm charts can use them as-is.
