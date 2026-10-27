# Darb Budokai

**The RPG your real life powers.**

Darb Budokai is a game world driven by things you actually do. Good posture refills your stamina. A code review becomes a boss fight. A study session teaches you a spell. A job application becomes a main quest, an interview is a raid, and an offer is the final boss. Each night the day's real events play back as a battle log on a 3D world map.

Darb Budokai merges two daily tools into one world:

- **Quest Log**: daily quests and habits.
- **Recall**: spaced-repetition study decks (SM-2). Study cards become spells.

Other projects in the same "universe" (Darb Scouter, Darb Juryoku, Darb Sennin, Darb Kinton, Darb Kaio, Darb Capsule, Darb Genki, Darb Enmacho) send events into Darb Budokai through Kafka. Darb Budokai defines the contracts and the ingest path for them. It does not build them.

Owner: Nour Alden Mousa ([@b14ckPanther](https://github.com/b14ckPanther), [zangeel.dev](https://zangeel.dev)).

## Why it exists

Darb Budokai publicly proves the **Java 21 + Spring Boot 3 + Angular** stack and event-driven microservices (Kafka, RabbitMQ, GraphQL, WebSockets), which Israeli job listings ask for. It has to be a product Nour uses every day, with a visual "signature moment", at a "jaw-dropping" quality bar. See `docs/VISION.md`.

## Stack

| Layer | Choice |
|---|---|
| Language / runtime | Java 21 (Temurin), Maven wrapper (`./mvnw`) |
| Services | Spring Boot 3.5.x, Spring Data JPA, Spring Security + JWT, Spring for GraphQL, Spring Kafka, Spring AMQP, STOMP over WebSockets |
| Data | PostgreSQL 17 (one database per service), Flyway migrations |
| Messaging | Apache Kafka 4.x (KRaft, no ZooKeeper) for event streams, RabbitMQ 4.x for work queues |
| Contracts | JSON Schema 2020-12 inside a CloudEvents 1.0 envelope (proposed, confirm with Nour in Phase 1) |
| Frontend | Angular 19 (standalone, signals), NgRx SignalStore, RxJS, Three.js |
| Tests | JUnit 5, AssertJ, Testcontainers, ArchUnit, Jest (proposed), Playwright + axe-core |
| Local infra | Docker Compose |
| Observability | Micrometer, Actuator, OpenTelemetry (OTLP) hooks for Darb Genki |

Exact versions are pinned in `docs/DECISIONS.md` (ADR-019).

## Folder map

```
Darb Budokai/
├── README.md               you are here
├── CLAUDE.md               agent operating manual (rules, workflow, commands, push checklist)
├── AGENTS.md               short pointer for non-Claude agent tools
├── pom.xml, mvnw           Maven parent (Spring Boot 3.5) and wrapper
├── libs/budokai-test-support   shared ArchUnit rules, Testcontainers base classes
├── services/character-service  first service (skeleton; domain arrives in Phase 4)
├── web/budokai-web         Angular 19 client (shell; screens arrive in Phases 2 and 3)
├── deploy/compose          local infra: Postgres, Kafka (KRaft), RabbitMQ, Kafka UI
├── tools/dev               gen-keys, no-emoji and commit checks, and their tests
├── brand/                  approved brand: seal, tokens, fonts, exports
├── .githooks/commit-msg    rejects attribution text in commit messages
└── docs/
    ├── VISION.md           intent, goals, non-goals, anti-goals
    ├── ARCHITECTURE.md     services, Kafka vs RabbitMQ, data ownership, contracts, compose, observability
    ├── GAME_DESIGN.md      how real events become game effects; rules engine; honesty rules
    ├── EVENT_CONTRACTS.md  every event type, its schema sketch and producer
    ├── UI_DESIGN.md        world map, character sheet, skill tree, battle log, quests, spells; art and motion
    ├── PLAN.md             master plan, Phase 0 to Phase 11, with weights (UI first)
    ├── PROGRESS.md         the ledger agents update after every task
    ├── DECISIONS.md        ADR log, seeded with fixed decisions
    ├── OPEN_QUESTIONS.md   what only Nour can decide (asked in Phase 1)
    └── CONVENTIONS.md      code style, layout, tests, commits, branches, PR template
```

Later phases fill in the full layout described in `docs/ARCHITECTURE.md` (section "Repository layout").

## How to start a session

1. Open a terminal in this folder and run Claude Code.
2. Say: **"start Phase 0"**.

The plan is **UI/UX frontend first**: after bootstrap (Phase 0) and spec confirmation with Nour (Phase 1), the design system (Phase 2) and a clickable prototype on seed data (Phase 3) are approved before any backend work.

The agent reads `CLAUDE.md`, then `docs/PROGRESS.md`, then `docs/PLAN.md`, and works phase by phase. To continue later, say **"resume"** (or "start Phase N"). The agent asks Nour before anything outward-facing: creating the GitHub repo, pushing to `main`, merging, publishing, deleting.

## Run it

Needs Docker, JDK 21 and Node 22.

```bash
git config core.hooksPath .githooks                          # attribution guard
tools/dev/gen-keys.sh                                        # local .env and JWT keys (git-ignored)
docker compose --env-file .env -f deploy/compose/compose.yml up -d           # Postgres, Kafka, RabbitMQ
./mvnw -q install -DskipTests                                # once, so services can resolve shared libs
./mvnw -pl services/character-service spring-boot:run        # http://localhost:8081/actuator/health
npm --prefix web/budokai-web ci && npm --prefix web/budokai-web start   # http://localhost:4200
docker compose --env-file .env -f deploy/compose/compose.yml down            # stop (volumes kept)
```

## Tests and quality

```bash
./mvnw -q verify                                # unit, Testcontainers ITs, ArchUnit, Spotless
npm --prefix web/budokai-web run lint           # angular-eslint + Prettier
npm --prefix web/budokai-web test               # Jest
npm --prefix web/budokai-web run e2e            # Playwright + axe
tools/dev/test/guards.test.sh                   # commit-msg hook, commit checker, no-emoji check
tools/dev/test/env.test.sh                      # key generator and .env.example coverage
tools/dev/test/compose-smoke.test.sh            # infra up, healthy, isolated roles, down
```

CI (`.github/workflows/ci.yml`) runs the guard, Java and web jobs on every push and PR, and the
e2e job on PRs.

## Status

Phase 0 (bootstrap) is done locally: Maven multi-module skeleton, one placeholder service, shared
ArchUnit rules and Testcontainers bases, Compose infra, an Angular 19 shell in the approved brand,
CI and the attribution guards. The GitHub repo is not created yet. Progress lives in
`docs/PROGRESS.md`.

## License and assets

All art, sound and fonts are original or properly licensed (Google Fonts are fine). No official game or anime IP. Licensed under MIT (`LICENSE`).
