# Decisions (ADR log)

Short architecture decision records. Newest at the bottom. Never delete an ADR; supersede it with a new one and mark the old one `Superseded by ADR-NNN`.

Status values: `Accepted` (fixed by Nour's roadmap or rules), `Proposed` (decided by the planning agent, **confirm with Nour in Phase 1**), `Superseded`.

Template:

```
## ADR-NNN: Title
- Status: Proposed | Accepted | Superseded by ADR-MMM
- Date: YYYY-MM-DD
- Context: why a decision is needed (2 to 4 lines)
- Decision: what we do
- Consequences: what this makes easier and harder
- Cost if wrong: low | medium | high, and what would need to change
```

---

## ADR-001: Darb Budokai is "the world itself" and merges Quest Log and Recall
- Status: Accepted (roadmap)
- Context: Nour's universe needs a centre that other projects feed. Quest Log (habits) and Recall (spaced repetition) were separate ideas.
- Decision: Darb Budokai is the RPG Nour's real life powers. Daily quests/habits and SM-2 study decks live inside it. Other projects send events in.
- Consequences: one product to use daily; Darb Budokai owns contracts for the whole universe.
- Cost if wrong: high.

## ADR-002: Java 21 and Spring Boot 3
- Status: Accepted (roadmap). Line: Spring Boot 3.5.x. Whether to move to Spring Boot 4 is asked in Phase 1.
- Context: Darb Budokai exists to prove the Java/Spring stack Israeli listings ask for.
- Decision: Java 21 (Temurin), Spring Boot 3, Maven wrapper, Spring Data JPA, Spring Security + JWT, Spring Kafka, Spring AMQP, Spring for GraphQL, STOMP.
- Consequences: industry-standard stack; heavier local footprint than Node.
- Cost if wrong: high.

## ADR-003: Angular 19 and Three.js for the client
- Status: Accepted (roadmap). Whether to use a newer Angular major is asked in Phase 1.
- Decision: Angular 19 standalone components, signals, RxJS, NgRx SignalStore; Three.js for the world map, skill tree and battle-log replay.
- Consequences: proves Angular (about 30% of full-stack listings); Three.js inside Angular needs a clean engine boundary.
- Cost if wrong: high.

## ADR-004: Microservices, one per domain, database per service
- Status: Accepted (roadmap: "stats, quests, inventory, spells")
- Decision: services `character`, `quest`, `inventory`, `spellbook`, plus `ingest`, `battlelog`, `notification`, `identity`, `gateway`. No service reads another's tables.
- Consequences: real data ownership and eventing; more moving parts locally (mitigated by Docker Compose profiles).
- Cost if wrong: high.

## ADR-005: Kafka for event streams
- Status: Accepted (roadmap)
- Decision: facts (life events, effects) go on Kafka topics keyed by user id. Kafka 4.x in KRaft mode.
- Consequences: replay, many consumers, per-user ordering. Topic names are proposed in ARCHITECTURE.md §4.
- Cost if wrong: high.

## ADR-006: RabbitMQ for work queues
- Status: Accepted (roadmap)
- Decision: tasks (nightly battle-log compile, daily quest generation, missed-day evaluation, Darb polling) go through RabbitMQ with retries, TTL delays and a DLX.
- Consequences: clear "facts vs work" split that is easy to explain in interviews.
- Cost if wrong: medium.

## ADR-007: Public GraphQL API with Spring for GraphQL
- Status: Accepted (roadmap)
- Decision: one public GraphQL endpoint in `gateway-service`; internal REST between gateway and services.
- Cost if wrong: medium.

## ADR-008: WebSockets with STOMP for live updates
- Status: Accepted (roadmap)
- Decision: `notification-service` exposes STOMP at `/ws`; user destinations; JWT on CONNECT.
- Cost if wrong: low.

## ADR-009: SM-2 for Recall
- Status: Accepted (roadmap)
- Decision: SM-2 scheduling, all parameters in `config/rulebook/v1/spells.yaml`. Cards become spells.
- Cost if wrong: low (scheduler is isolated behind an interface).

## ADR-010: TDD with JUnit 5 and Testcontainers
- Status: Accepted (rules)
- Decision: failing test first; Testcontainers for Postgres, Kafka, RabbitMQ; no live third-party calls in tests or CI.
- Cost if wrong: n/a (rule).

## ADR-011: No hardcoded data; rulebook in versioned config
- Status: Accepted (rules)
- Decision: rules, curves, tables, thresholds, templates, copy and seed content in `config/**` or the database; fixtures only in tests and `demo` mode; ArchUnit guard.
- Cost if wrong: n/a (rule).

## ADR-012: Nour is the only author; no AI attribution
- Status: Accepted (rules)
- Decision: all commits authored and committed as `Nour Alden Mousa <nmcryptoinvest@gmail.com>`; no attribution text anywhere; commit-msg hook and CI guard; push checklist.
- Cost if wrong: n/a (rule).

## ADR-013: Original assets only; repo will be public
- Status: Accepted (rules)
- Decision: no official game/anime IP; original or properly licensed art, sound and fonts (Google Fonts OK); `ASSETS.md` registry.

## ADR-014: Ask before outward-facing actions; branch per phase
- Status: Accepted (rules)
- Decision: ask Nour before creating/publicising the repo, pushing to `main`, merging, publishing, deleting. Branch `phase/NN-name`. Small honest commits.

## ADR-015: Superpowers workflow with a ledger
- Status: Accepted (rules)
- Decision: brainstorming → spec → writing-plans → executing-plans (native) with `docs/PROGRESS.md` → whole-branch review → finish, per phase.

## ADR-016: Event contracts are JSON Schema 2020-12 in a CloudEvents 1.0 envelope
- Status: Proposed
- Context: the roadmap requires versioned contracts (JSON Schema or Avro). Producers will be Python, Dart, Go/.NET-adjacent, TypeScript and a LangGraph agent.
- Decision: JSON Schema per type and major version in `contracts/events/`; CloudEvents envelope with Darb Budokai extensions; no Schema Registry. Avro stays an option for Darb Genki.
- Consequences: readable, polyglot, simple locally; no binary compactness or registry-enforced compatibility (replaced by a compat test in CI).
- Cost if wrong: medium (envelope stays; payload encoding could switch behind `libs/budokai-contracts`).

## ADR-017: Sibling projects integrate through contracts and an ingest service
- Status: Accepted (roadmap)
- Decision: Darb Budokai defines contracts and `ingest-service` (HMAC-signed HTTP, plus a Darb Scouter poller). A dev simulator emits realistic events. Darb Budokai does not build sibling projects.

## ADR-018: UI/UX frontend first
- Status: Accepted (rules; Nour: "all the apps will be UI UX Frontend first")
- Decision: Phase 2 (design system, chosen with Nour side by side) and Phase 3 (clickable prototype on seed data, approved screen by screen) are merged before any backend phase.
- Consequences: the GraphQL schema and replay script format are shaped by real screens; backend phases build to a known UI.

## ADR-019: Pinned versions
- Status: Accepted (filled in during Phase 0, 2026-10-26)
- Decision: record exact versions chosen at bootstrap. Libraries that arrive in later phases (Spring for GraphQL, NgRx Signals, Three.js, Apollo Angular) are pinned in this table by the phase that adds them.

| Component | Version | Why this one |
|---|---|---|
| Java | 21 (Temurin in CI, Homebrew OpenJDK 21 locally) | Roadmap (ADR-002); compiled with `--release 21` |
| Maven (wrapper) | 3.9.16, wrapper 3.3.4 (`only-script`) | Latest 3.9 line; no binary jar committed |
| Spring Boot | 3.5.16 (Spring Framework 6.2.19, Hibernate 6.6.53) | Latest 3.5.x, per Q18 default |
| Testcontainers | 1.21.4 | Version Boot 3.5.16 manages; works with Docker Engine 29 |
| ArchUnit | 1.4.2 | Stable JUnit 5 line |
| Spotless / palantir-java-format | 3.10.4 / 2.102.0 | Latest at bootstrap |
| JaCoCo | 0.8.16 | Latest; supports Java 21+ bytecode |
| PostgreSQL image | `postgres:17.11-alpine` | Postgres 17 per ARCHITECTURE.md |
| Kafka image | `apache/kafka:4.3.2` (KRaft) | Latest 4.x patch older than two weeks (4.4.0 was days old) |
| RabbitMQ image | `rabbitmq:4.3.7-management-alpine` | Latest 4.x with management UI |
| Kafka UI image | `kafbat/kafka-ui:v1.5.0` | Maintained fork; `provectuslabs/kafka-ui` is unmaintained |
| Node | 22 (`.nvmrc`, CI) | Angular 19 supports 18.19, 20.11, 22; local Node 26 also passed every check |
| Angular / CLI | 19.2.25 / 19.2.27 | Roadmap and Q18 default |
| TypeScript / RxJS / zone.js | 5.7.3 / 7.8.2 / 0.15.1 | As generated by Angular CLI 19 |
| Jest / jest-preset-angular | 29.7.0 / 14.6.2 | ADR-029 |
| angular-eslint / ESLint / Prettier | 19.8.1 / 9.39.5 / 3.9.10 | Matching Angular 19 |
| Playwright / @axe-core/playwright | 1.64.1 / 4.14.0 | Latest at bootstrap |

## ADR-031: Phase 0 rulings under Nour's delegation
- Status: Accepted. Decided by the agent under Nour's delegation (2026-10-26: "any choice by u will be approved from my side"). Nour can overturn any of these; each is cheap to change.
- Q17 (repo, visibility, licence): repo name `darb-budokai` under `b14ckPanther`, **private** until Phase 11, **MIT** licence (`LICENSE` committed). The GitHub repo is **not created yet**; that and every push still wait for Nour.
- Q18 (versions): stay on Angular 19 and Spring Boot 3.5.x as the roadmap lists. Cost if wrong: medium (a major upgrade later).
- ADR-029 (Jest) used as proposed: Karma removed, `jest-preset-angular`. Cost if wrong: low.
- Host ports avoid defaults so other local Darb stacks can run alongside: Postgres 54320, AMQP 55672, Kafka UI 18090 (Kafka 9092, RabbitMQ UI 15672, character-service 8081 unchanged). All overridable in `.env`. Cost if wrong: low.
- Postgres bootstrap is `deploy/compose/postgres/init.sh` (not `init.sql`) so role passwords come from `.env` instead of a committed file. `CONNECT` on `postgres`/`template1` is revoked from `PUBLIC`, so service roles reach only their own database (ADR-022). Cost if wrong: low.
- Testcontainers images are read from `budokai-test-containers.properties` (overridable by system property), not from code. Cost if wrong: low.
- The Phase 0 web shell uses the approved brand directly: tokens and seal from `brand/exports/`, and Latin WOFF2 subsets of Zen Antique (19 KB) and Geist (30 KB) instead of the multi-megabyte TTFs. The design system itself is still Phase 2. Cost if wrong: low.
- Phase 0 merges into `main` locally after the self-review; nothing is pushed.

## ADR-020: Choreography with causation and correlation ids
- Status: Proposed
- Decision: no orchestrator. Services react to events and emit effects carrying `causationid` and `correlationid`; battlelog reconstructs encounters from them.
- Cost if wrong: medium.

## ADR-021: Transactional outbox and idempotent inbox
- Status: Proposed
- Decision: every service publishes via an `outbox_events` table and relay; consumers record `processed_events` in the same transaction.
- Cost if wrong: low (internal to `libs/budokai-platform`).

## ADR-022: One Postgres server locally, one logical database and role per service
- Status: Proposed
- Decision: `init.sql` creates `<service>_db` and `<service>_svc` per service with no cross grants. Separate instances later in Darb Genki.
- Cost if wrong: low.

## ADR-023: Rules engine is declarative YAML with a restricted predicate language
- Status: Proposed
- Decision: typed effect specs and amount specs from YAML; `when` predicates evaluated with SpEL `SimpleEvaluationContext` (read-only data binding); closed set of curve types.
- Cost if wrong: medium.

## ADR-024: Gateway calls services over internal REST (no GraphQL federation)
- Status: Proposed
- Cost if wrong: medium (federation could be added later per service).

## ADR-025: Battle-log narration from copy templates, no LLM
- Status: Proposed
- Decision: narration lines from `config/copy/en/battlelog.yaml`; deterministic. Darb Kaio could add LLM flavour later as an optional producer.
- Cost if wrong: low.

## ADR-026: Deterministic loot and replay
- Status: Proposed
- Decision: loot RNG seeded by SHA-256(causationId + rulebookVersion + tableId); replay scripts byte-identical for identical inputs.
- Cost if wrong: low.

## ADR-027: Native feel, one modern SVG icon set, no emoji
- Status: Accepted (rules)
- Decision: SwiftUI-like mobile behaviour (safe areas, large titles, tab bar, sheets with detents, springs, pressed scale, 44 pt targets, swipe actions); one SVG icon set (Solar via Iconify or Lucide, picked in Phase 1) plus custom SVG; company logos only via Iconify Simple Icons; no emoji anywhere, enforced in CI.

## ADR-028: Agents use the installed skills
- Status: Accepted (rules)
- Decision: agents check the skill list before every task, invoke matching skills first, and record them in the ledger. Mapping in CLAUDE.md §2a and each phase's "Skills:" line.

## ADR-029: Web unit tests with Jest; e2e with Playwright and axe
- Status: Proposed
- Context: Karma is deprecated upstream; Darb Budokai needs fast unit tests and accessible e2e.
- Decision: `jest-preset-angular` for unit tests, Playwright + `@axe-core/playwright` for e2e.
- Cost if wrong: low.

## ADR-030: SCSS design tokens, no Tailwind
- Status: Proposed
- Decision: hand-built SCSS tokens and components for a non-template look; Angular CDK for overlays, focus and a11y primitives.
- Cost if wrong: low.
