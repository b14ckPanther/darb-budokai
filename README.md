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

Exact patch versions are pinned in Phase 0 and recorded in `docs/DECISIONS.md`.

## Folder map (this planning package)

```
Darb Budokai/
├── README.md               you are here
├── CLAUDE.md               agent operating manual (rules, workflow, commands, push checklist)
├── AGENTS.md               short pointer for non-Claude agent tools
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

After Phase 0 the repo grows the code layout described in `docs/ARCHITECTURE.md` (section "Repository layout").

## How to start a session

1. Open a terminal in this folder and run Claude Code.
2. Say: **"start Phase 0"**.

The plan is **UI/UX frontend first**: after bootstrap (Phase 0) and spec confirmation with Nour (Phase 1), the design system (Phase 2) and a clickable prototype on seed data (Phase 3) are approved before any backend work.

The agent reads `CLAUDE.md`, then `docs/PROGRESS.md`, then `docs/PLAN.md`, and works phase by phase. To continue later, say **"resume"** (or "start Phase N"). The agent asks Nour before anything outward-facing: creating the GitHub repo, pushing to `main`, merging, publishing, deleting.

## Status

Planning package only. No code yet. Progress lives in `docs/PROGRESS.md`.

## License and assets

All art, sound and fonts are original or properly licensed (Google Fonts are fine). No official game or anime IP. License is chosen in Phase 0 (MIT proposed, confirm with Nour in Phase 1).
