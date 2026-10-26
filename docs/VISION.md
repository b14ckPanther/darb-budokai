# Vision

## One line

**Darb Budokai is the world itself: an RPG that only your real life can play.**

## Intent

Darb Budokai turns real, evidence-backed events from Nour's day into a living game world. It merges two daily tools:

- **Quest Log**: daily quests and habits.
- **Recall**: spaced-repetition study decks (SM-2). Cards you learn become spells.

Every other project in Nour's universe feeds it through Kafka: posture sets stamina, Darb Sennin reviews are boss fights, study sessions teach spells, job applications are main quests, interviews are raids, an offer is the final boss. Spring Boot runs the rules: stats, XP, loot and consequences.

**Signature moment:** an Angular + Three.js world map with a character sheet and a skill tree. Each night the day's real events play back as a battle log across the map.

## Why it exists (the career goal)

Nour's public GitHub is about 90% Next.js / Supabase / TypeScript. Israeli junior listings (banks, insurance, NCR, Infinidat and others) keep asking for Java, Spring Boot, Angular, microservices and Kafka. In a sample of 431 listings: Kafka appeared in 61, microservices in 127, Java in 70, and Angular in about 30% of full-stack listings. Darb Budokai must make each of these skills **visible in the code and the README**, not just listed:

| Skill | Where Darb Budokai proves it |
|---|---|
| Java 21 | records, sealed interfaces for effects, pattern matching in the rules engine, virtual threads in consumers |
| Spring Boot 3 | nine services, profiles, config properties, Actuator |
| Spring Data JPA | per-service domain models, Flyway, optimistic locking |
| Spring Security + JWT | identity-service issues RS256 tokens; gateway and notification validate via JWKS |
| Microservices | one service per domain, database per service, outbox, idempotent consumers |
| Kafka | life-event and effect streams, keyed by user, replayable |
| RabbitMQ | nightly battle-log compile, daily quest generation, missed-day evaluation, Darb polling, with retry and DLQ |
| GraphQL | Spring for GraphQL public API with DataLoader batching and query limits |
| WebSockets / STOMP | live effect toasts and battle-log updates |
| Spaced repetition | SM-2 in spellbook-service, parameters in config |
| JUnit 5 + Testcontainers | every integration test runs real Postgres, Kafka, RabbitMQ |
| Angular signals, RxJS, NgRx SignalStore | the whole web client |
| Three.js | the world map and the battle-log replay |

## Goals

1. **Daily use.** Nour opens Darb Budokai every day because it is the most honest summary of their day, and Recall is where they study.
2. **A signature moment worth a GIF.** The nightly battle log replaying on the 3D map is the hero of the README.
3. **Readable architecture.** A reviewer can open `docs/ARCHITECTURE.md`, see the diagram, run `docker compose up`, and watch events flow in under 10 minutes.
4. **Honest game economy.** Rewards come only from real events with evidence. The numbers live in config and can be inspected in the app.
5. **Pluggable universe.** Versioned event contracts and an ingest service let sibling projects plug in later without changing Darb Budokai's core.
6. **Professional engineering signals.** TDD, Testcontainers, CI, ADRs, clean commit history authored only by Nour.

## Non-goals (for this repo)

- Building the sibling projects (Darb Scouter, Darb Juryoku, Darb Sennin, Darb Kinton, Darb Kaio, Darb Capsule, Darb Genki, Darb Enmacho). Darb Budokai only defines their contracts and an ingest path, plus a simulator.
- Kubernetes, Helm, Grafana dashboards. That is Darb Genki. Darb Budokai only exposes the hooks (health probes, metrics, OTLP traces).
- Multiplayer, guilds, chat, leaderboards (unless Nour decides otherwise in Phase 1).
- Monetisation of any kind.
- A mobile app (that is Darb Capsule). The web client must still work well on a phone.
- An LLM in the core loop. Battle-log narration is template-driven from config (proposed, confirm with Nour in Phase 1).

## Anti-goals (these mean failure)

- **A generic habit tracker with an RPG skin.** If removing the map and the names leaves a checkbox list with a progress bar, Darb Budokai has failed. Events must have real game consequences that interact (spells help in boss fights, stamina shapes the day, quests chain).
- **A fake, flattering economy.** XP for opening the app, streak insurance, "you're doing great" on a day with no evidence, loot that rains on everything. All failure. The game must be able to say "nothing happened today".
- **Childish or template-looking UI.** No cartoon mascots, bubbly fonts, confetti for everything, default Material or Bootstrap look. Cinematic, restrained, original.
- **Borrowed IP.** Anything that looks like a known game, anime or franchise.
- **Hardcoded rules.** If balancing the game needs a code change, the design is wrong.
- **A microservice diagram for show.** Each service must own real data and a real responsibility; each broker must be used where it is the right tool, and the docs must say why.
- **Unfinished demo.** A half-wired system with a pretty screenshot. Every phase ships something that runs.

## Who uses it

Primary user: Nour, every day, on desktop and phone. Secondary audience: recruiters and interviewers reading the README, watching the demo GIF, and skimming the code. Whether Darb Budokai is single-user or multi-user is an open question (see `OPEN_QUESTIONS.md`); the design keeps `userId` on every record so either works.

## Success looks like

- Nour uses it daily for a month without being asked.
- A recruiter can understand what it does from the README GIF in 15 seconds.
- An interviewer can ask "why Kafka here and RabbitMQ there?" and the answer is in `ARCHITECTURE.md` and the code agrees.
- `./mvnw verify` and the web tests pass in CI on every commit to `main`.
