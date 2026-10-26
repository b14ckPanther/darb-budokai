# Master plan: Darb Budokai from 0% to 100%

Twelve phases. Each one is a shippable increment that runs from a clean checkout. Weights add up to 100%.

**UI/UX and frontend first.** Nour: "all the apps will be UI UX Frontend first". Right after bootstrap and spec confirmation, Phase 2 (design system, chosen with Nour side by side) and Phase 3 (clickable prototype on seed data, approved screen by screen) must be **done and approved before any backend phase (4 and later) starts**. No service code is written before Phase 3 is merged.

| Phase | Name | Weight | Cumulative | Branch |
|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 5% | 5% | `phase/00-bootstrap` |
| 1 | Brainstorm and spec confirmation with Nour | 4% | 9% | `phase/01-spec` |
| 2 | Design system (tokens, type, motion, components) | 6% | 15% | `phase/02-design-system` |
| 3 | Frontend prototype on seed data (all screens, 3D map, battle log) | 12% | 27% | `phase/03-ui-prototype` |
| 4 | Core domain services and rules engine | 13% | 40% | `phase/04-core-domain` |
| 5 | Kafka/RabbitMQ eventing, ingest, simulator | 11% | 51% | `phase/05-eventing` |
| 6 | GraphQL gateway and auth | 9% | 60% | `phase/06-gateway-auth` |
| 7 | WebSockets live updates and nightly battle log | 10% | 70% | `phase/07-live-battlelog` |
| 8 | Recall: SM-2 spells | 9% | 79% | `phase/08-recall-spells` |
| 9 | Darb Scouter integration | 5% | 84% | `phase/09-darb` |
| 10 | Hardening: tests, load, security | 9% | 93% | `phase/10-hardening` |
| 11 | Docs, demo GIF, public launch (ask Nour) | 7% | 100% | `phase/11-launch` |

Every phase has a **Skills:** line. Invoke each listed skill with the Skill tool at the start of the phase (and again before the specific task it fits), and name the skills used in the phase's ledger rows. See CLAUDE.md "Skills to use".

## How every phase runs

1. `git switch -c phase/NN-name` from an up-to-date `main` (after Phase 0).
2. Brainstorm the phase (`superpowers:brainstorming`), write `docs/specs/YYYY-MM-DD-phase-NN-<topic>.md`, get Nour's OK.
3. Turn the task list below into `docs/plans/YYYY-MM-DD-phase-NN-<topic>.md` (`superpowers:writing-plans`), refining tasks to 2 to 15 minute steps.
4. Execute (`superpowers:executing-plans`): for each task, test first, see it fail, implement, see it pass, commit, add a ledger row to `docs/PROGRESS.md`.
5. Whole-branch review (`superpowers:requesting-code-review`), fix, run the phase's proof tests and push checklist, then ask Nour to merge (`superpowers:finishing-a-development-branch`).

Commit convention for every phase: imperative plain English, one real step per commit, authored by Nour, no attribution, never the word "claude" (see `CONVENTIONS.md`). Expect 15 to 60 commits per phase.

Task lists below are ordered for TDD: the test task always comes before the code it proves. "Test:" lines name the test class or spec to write first.

---

## Phase 0: Repo bootstrap, CI, conventions (5%)

**Goal:** an empty-but-real monorepo that builds, tests and lints in CI, with identity and attribution guards in place.

**Skills:** `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`, `run`.

**Deliverables:** git repo with Nour as the only author; Maven multi-module skeleton; Angular 19 app skeleton; Docker Compose infra; CI workflow; commit-msg hook; agent settings; `.env.example`; licence; this planning package committed under `docs/`.

**Tasks**
1. Confirm with Nour: repo name `budokai`, owner `b14ckPanther`, start **private** (proposed), licence MIT (proposed). Wait for the answer before step 15.
2. `git init -b main`; `git config user.name "Nour Alden Mousa"`; `git config user.email "nmcryptoinvest@gmail.com"`. Verify with `git config --get user.email`.
3. Add `.gitignore` (Java, Maven `target/`, Node, Angular `.angular/`, IDE folders, `.env`, `*.pem`), `.editorconfig`, `.gitattributes` (`* text=auto eol=lf`, `mvnw text eol=lf`).
4. Add `.githooks/commit-msg` that rejects messages matching `co-authored|claude|anthropic|generated with` (case-insensitive) and exits non-zero with a clear message; `git config core.hooksPath .githooks`. Test it by trying a bad message in a scratch commit (`git commit --allow-empty -m "Co-Authored-By: x"` must fail).
4b. Add `tools/dev/check-no-emoji.sh` (scans tracked text files and commit messages for emoji code points with `grep -P` / `rg`, exits non-zero on a hit). Test: run it on a scratch file containing an emoji (must fail) and on the clean tree (must pass). Add it to CI.
5. Add `.claude/settings.json` with `{"attribution": {"commit": "", "pr": ""}, "includeCoAuthoredBy": false}`.
6. First commit: the planning docs (`README.md`, agent manual files, `docs/`). Message: `Add Darb Budokai planning package`. Run the push checklist commands to see they pass.
7. Parent `pom.xml` (groupId `dev.zangeel.budokai`, Java 21, Spring Boot 3.5.x BOM as parent, Testcontainers BOM, Spotless with palantir-java-format, Surefire + Failsafe, JaCoCo). Add Maven wrapper (`mvn -N wrapper:wrapper` or Spring Initializr wrapper files). Verify `./mvnw -v`.
8. `libs/budokai-test-support`: Test: `ArchitectureRulesTest` sample rule (no `java.util.Random` in main code, no `static final` numeric fields in `..rules..`). Then the reusable ArchUnit rules and an abstract `PostgresContainerTest` / `KafkaContainerTest` / `RabbitContainerTest` using `@ServiceConnection`.
9. One placeholder service, `services/character-service` generated from Spring Initializr (web, actuator, data-jpa, flyway, postgresql, validation, testcontainers). Test: `CharacterServiceApplicationTests` context loads against Testcontainers Postgres; `HealthEndpointIT` returns UP. Then make it pass.
10. `deploy/compose/compose.yml` with postgres 17, kafka (KRaft), rabbitmq 4 management, kafka-ui (profile `tools`); `deploy/compose/postgres/init.sql` creating `character_db` + role (others added per phase). Smoke: `docker compose ... up -d` then `docker compose ... ps` all healthy.
11. `web/budokai-web`: `npx @angular/cli@19 new budokai-web --standalone --routing --style=scss --ssr=false`. Add ESLint (angular-eslint), Prettier, Jest (proposed, via `jest-preset-angular`), Playwright + `@axe-core/playwright`. Test: an `app.component.spec.ts` and one Playwright smoke spec with an axe check; make them pass.
12. `.env.example` with every variable introduced so far; `tools/dev/gen-keys.sh` that writes a local RS256 key pair and HMAC secrets into `.env` (never committed).
13. `.github/workflows/ci.yml`: jobs `java` (Temurin 21, cache Maven, `./mvnw -B verify`), `web` (Node 22, `npm ci`, `lint`, `test`, `build`), `e2e` (Playwright, on PRs), `guard` (runs the two push-checklist commands over the PR's commits and fails on any non-Nour author or attribution text, plus `tools/dev/check-no-emoji.sh`). No secrets needed; no live third-party calls.
14. `LICENSE` (after Nour confirms), `CONTRIBUTING.md` pointing to `docs/CONVENTIONS.md`, `.github/pull_request_template.md` from `CONVENTIONS.md`.
15. **Ask Nour** to create the GitHub repo. On "yes": `gh repo create b14ckPanther/darb-budokai --private --source . --remote origin`, push `main` (ask), then push the phase branch.
16. Record pinned versions in `docs/DECISIONS.md` (ADR-019 "Pinned versions"); update `PROGRESS.md`.

**Tests that prove it:** `./mvnw verify` green (context load + ArchUnit + health IT); `npm test`, `npm run lint`, `npm run e2e` green; CI green on the first PR; commit-msg hook rejects an attribution message; push checklist prints only Nour and `0`.

**Definition of done:** CLAUDE.md §6, plus Nour has the repo URL and CI badge is green.

---

## Phase 1: Brainstorm and spec confirmation with Nour (4%)

**Goal:** turn every "proposed" item into a decision. No code.

**Skills:** `superpowers:brainstorming`, `design-first-ui-prompting`, `design-taste-frontend`, `frontend-design`, `audit-reference-originality` (for any reference Nour shares), `writing-guidelines`.

**Deliverables:** answered `docs/OPEN_QUESTIONS.md`; updated `DECISIONS.md` (ADRs accepted or changed); updated `GAME_DESIGN.md`, `UI_DESIGN.md`, `ARCHITECTURE.md`, `EVENT_CONTRACTS.md` where answers change them; `docs/specs/YYYY-MM-DD-phase-01-budokai-spec.md` (the consolidated spec Nour signs off).

**Tasks**
1. Use `superpowers:brainstorming`. Ask the questions in `docs/OPEN_QUESTIONS.md` **one at a time, open-ended first**, in the order given there. Do not batch questions. Offer a recommended default with each question only after Nour has answered the open part.
2. After each answer, record it in `OPEN_QUESTIONS.md` (answer + date) and, if it is a decision, as an ADR in `DECISIONS.md`. Commit after every two or three answers (`Record decisions on stamina and missed days`).
3. For the art direction question, produce 2 or 3 **mood boards in words** plus a quick static HTML/CSS swatch page (in `docs/specs/assets/`, not the app) for Nour to react to. Original visuals only.
4. Update the affected design docs. Remove "proposed" labels only where Nour confirmed.
5. Write the consolidated spec; ask Nour to approve it explicitly.

**Tests that prove it:** none in code. Proof is Nour's written approval recorded in `PROGRESS.md` and every question in `OPEN_QUESTIONS.md` marked answered or deferred-with-default.

**Definition of done:** spec approved; no unanswered blocking question; ADRs updated.

---

## Phase 2: Design system (6%)

**Goal:** Darb Budokai's visual language exists as code and is chosen with Nour side by side: tokens, type, icons, motion rules and base components, plus a first proof that the 3D map style works.

**Skills:** `frontend-design`, `impeccable:impeccable`, `design-taste-frontend`, `build-awwwards-quality-sites`, `design-first-ui-prompting`, `design:design-system`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `web-design-guidelines`, `audit-reference-originality`, `animation-systems`, `solar-duotone-bold` (or Lucide, per Phase 1), `threejs-choose-skills` then `threejs-web-design`, `threejs-procedural-materials`, `threejs-exposure-color-grading`, `superpowers:test-driven-development`, `playwright-cli`.

**Deliverables:** design tokens (colour, type, space, radius, elevation, motion, spring presets); self-hosted fonts; one icon set wired through Iconify or an SVG sprite; base Angular components; reduced-motion service; a living style page at `/design` (dev and demo only); a single-scene 3D "look test" of the map material and lighting; `ASSETS.md`.

**Tasks**
1. Present 2 or 3 direction boards (from UI_DESIGN.md §1 and Nour's Phase 1 answer) as a static page side by side; Nour picks or mixes. Record the choice as an ADR.
2. Design tokens (`styles/tokens.scss` + `tokens.ts` for Three.js colours). Test first: `contrast.spec.ts` computes WCAG contrast for every declared text/background pair and fails below AA.
3. Fonts self-hosted, licences in `ASSETS.md`.
4. Icon pipeline: one set only (Solar duotone via Iconify or Lucide, chosen in Phase 1) plus custom SVG sigils. Test: `icons.spec.ts` fails if a component references an icon outside the registry; `no-emoji.spec.ts` scans `src/**` and `config/copy/**` for emoji code points.
5. Motion tokens and spring presets (`--dur-*`, easing curves, spring stiffness/damping as config in `tokens.ts`). Reduced-motion service (OS media query + in-app override as a signal). Test: toggling sets `data-motion="reduced"` on `<html>`.
6. Base components: button (pressed-state scale), panel, tabs, bottom tab bar (mobile), sheet with detents and drag-to-dismiss, large collapsing title header, list row with swipe actions, stat dial, progress bar, toast, dialog, evidence-tier badge, focus ring. Test each first: keyboard operation, ARIA roles, 44 px touch target, reduced-motion behaviour.
7. Map look test: one Three.js scene with procedural terrain patch, contour shader, ember light and fog, at three light levels. Nour reviews screenshots. Test: engine unit tests for the render-on-demand scheduler with a fake clock.
8. `/design` style page showing every token and component in light of the chosen direction. Playwright + axe on it.
9. **Approval checkpoint:** Nour approves the design system (screenshots of `/design` on desktop and a 390 px phone, plus the map look test).

**Tests that prove it:** `npm test` (contrast, icon registry, no-emoji, components), `npm run e2e` (`/design` with axe, zero serious/critical), approval recorded in `PROGRESS.md`.

**Definition of done:** Nour approved the design system; no emoji anywhere; one icon set; every component keyboard and reduced-motion safe.

---

## Phase 3: Frontend prototype on seed data (12%)

**Goal:** the signature screens exist, look jaw-dropping, and run in the browser as a clickable prototype on realistic demo data with no backend. Approved by Nour screen by screen. **Backend work starts only after this phase is merged.**

**Skills:** `threejs-choose-skills` first, then `threejs`, `threejs-web-design`, `3dviz-pro-max`, `threejs-procedural-geometry`, `threejs-procedural-materials`, `threejs-bloom`, `threejs-camera-controls-and-rigs`, `threejs-particles-trails-and-effects`, `threejs-exposure-color-grading`, `threejs-compatibility-fallbacks`, `threejs-debugging`, `threejs-visual-validation`, `optimize-threejs-games`, `add-mouse-driven-orbit`; game skills `author-game-levels`, `build-game-camera-controls`, `create-game-vfx`, `build-game-audio-feedback`, `test-playable-web-games`; also installed and relevant: `threejs-landscape`, `threejs-sky-atmosphere-and-haze`, `implement-fog-of-war`, `build-game-inventory`; UI: `frontend-design`, `impeccable:impeccable`, `design-taste-frontend`, `build-awwwards-quality-sites`, `ui-implementer`, `design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `design:design-handoff`, `writing-guidelines`; motion: `gsap`, `animation-systems`, `optimize-web-animations`; `procedural-sfx` (optional sound); `dataviz` (Spellbook retention and Character Sheet charts); `playwright-cli`, `performance-profiling`, `superpowers:test-driven-development`.

**Deliverables:** Three.js world map with regions, fog, light and markers; Character Sheet; Skill Tree; Battle Log player (playing a seed replay script); Quest Log; Spellbook review session (client-side SM-2 preview only); Rulebook viewer; Integrations; demo seed in `config/seed/demo/`; Playwright + axe coverage; screenshots approved by Nour.

**Tasks** (each screen: build → screenshot desktop + 390 px phone → Nour approval → next)
1. Seed data: write `config/seed/demo/` (persona, 14 days of timeline, 3 decks with 40 cards, 4 main quests across stages, 1 boss, a replay script) and a JSON Schema for the replay script in `contracts/replay/v1.schema.json`. Test: `seed-data.spec.ts` validates every seed file against its schema.
2. Fixture GraphQL link (`environment.demo.ts`) and a "Demo data" banner. Test: banner visible in demo mode, absent otherwise.
3. App shell: desktop side rail, mobile bottom tab bar, safe-area insets, large collapsing titles, route transitions with spring presets. Test: Playwright at 390 px shows the tab bar and respects safe areas.
4. World engine skeleton (`features/world/engine`): renderer, camera rig, render-on-demand loop, resize, DPR cap, dispose. Test: unit tests on the camera-rig math.
5. Procedural terrain + contour shader + region tints from `map.yaml`-shaped seed. Test: region lookup by world coordinate; region config parsing.
6. Light and fog per region driven by MapStore signals. Test: MapStore maps timeline effects to region light/fog values.
7. Markers (quests, bosses, raids, portals) + DOM focus list twin. Test: Playwright keyboard walk reaches every marker and opens its panel (a sheet on mobile).
8. WebGL-unavailable 2D SVG fallback. Test: Playwright with WebGL disabled shows the SVG map.
9. **Approval checkpoint: World Map.**
10. Character Sheet. Test: renders stats/stamina from store; every number has a text label. **Approval checkpoint.**
11. Skill Tree (3D constellation + DOM list). Test: node states from seed; requirement text rendered from config copy. **Approval checkpoint.**
12. Battle Log player: script interpreter (pure TS) + camera path + captions + controls. Test first: `replay-interpreter.spec.ts` (step, seek, speed, end, empty day). Then UI. Test: Playwright plays seed script, pause/next/seek by keyboard; reduced motion uses crossfades. **Approval checkpoint.**
13. Quest Log tabs and habit editor (local only; swipe actions on mobile rows). **Approval checkpoint.**
14. Spellbook shelf + review session (grades call a client SM-2 preview from shared fixtures). **Approval checkpoint.**
15. Rulebook viewer and Integrations (seed). **Approval checkpoint.**
16. Performance pass (60 fps target on the map on a mid laptop, Lighthouse performance ≥ 85 on Character Sheet, proposed) with `threejs-visual-validation` screenshots.
17. axe on every route in Playwright; no-emoji and icon-registry checks green.

**Tests that prove it:** `npm test` (stores, interpreter, components), `npm run e2e` (every screen, keyboard walk, axe zero serious/critical, WebGL fallback, mobile layout), recorded approvals for every screen.

**Definition of done:** every screen approved by Nour; no hardcoded game data in components (all from seed/config); reduced motion works; mobile feels native (CLAUDE.md §1.9).

---

## Phase 4: Core domain services and rules engine (13%)

**Goal:** the game rules run in Spring Boot: character, quests, inventory, with the rulebook loaded from config and state in each service's database. Driven by internal REST and tests only (eventing is Phase 5).

**Skills:** `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:subagent-driven-development` (independent services in parallel), `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `superpowers:receiving-code-review`, `code-review`, `simplify`, `superpowers:finishing-a-development-branch`.

**Deliverables:** `libs/budokai-rules-core`; `config/rulebook/v1/*.yaml` + `rulebook.schema.json`; `character-service`, `quest-service`, `inventory-service` with Flyway schemas, domain models, internal REST APIs, `libs/budokai-platform` (error handling, outbox table + relay skeleton, inbox).

**Tasks**
1. Test: `RulebookLoaderTest` loads a minimal YAML fixture into typed records; fails on unknown keys and on schema violations. Implement `RulebookLoader` (Jackson YAML + networknt JSON Schema validator).
2. Test: `CurveTest` for `power`, `linear`, `table` curves (xp-to-level, inverse). Implement curves (parameters only from config).
3. Test: `PredicateEvaluatorTest` (allowed: comparisons on payload fields; rejected: type references `T(java.lang.Runtime)`, method calls). Implement with SpEL `SimpleEvaluationContext`.
4. Test: `AmountSpecTest` (`fixed`, `per/rate`, `cap_per_day`, `table`). Implement.
5. Test: `RuleEvaluatorTest` with the real `config/rulebook/v1` for posture → stamina, review → boss, quest completed → XP. Implement the pure `RuleEvaluator`.
6. Write `config/rulebook/v1/` (character, quests, loot, evidence, skill-tree, map, meta) from GAME_DESIGN.md defaults (as confirmed in Phase 1). Test: `RealRulebookValidTest` loads and validates it; every rule references a known event type and effect kind.
7. ArchUnit: no numeric constants in `..rules..`/`..domain..`; domain does not depend on web or persistence packages.
8. `libs/budokai-platform`: Test: `OutboxRelayIT` (Testcontainers Postgres; fake publisher) publishes pending rows once, in order, with `SKIP LOCKED`. Test: `InboxIT` duplicate event id is skipped. Implement.
9. character-service: Flyway `V1__character.sql`. Tests: `CharacterTest` (XP award → level up across multiple levels, stamina clamp, exhausted status), `CharacterRepositoryIT`, `ApplyEffectsIT` (stamina daily cap enforced across calls). Implement aggregate, service, internal REST `GET /internal/characters/{userId}`, `POST /internal/characters/{userId}/effects` (temporary test driver until Phase 5).
10. quest-service: Flyway, quest templates seeded from config on startup (idempotent). Tests: daily quest progress by objective type; main quest lifecycle over all nine Darb stages incl. regressions (no re-award); boss HP from findings, damage, defeat; raid open/clear; missed-day evaluation (fail, streak reset, fog delta). Implement.
11. inventory-service: Flyway, item catalogue from config. Tests: `LootRollerTest` determinism (same seed → same item; distribution within tolerance over 10k rolls with a fixed table); modifier cap enforced; equip slot rules. Implement.
12. Add the three services to compose (profile `apps`) and `init.sql`. Smoke: `curl` the internal endpoints with the service token stubbed.

**Tests that prove it:** `./mvnw verify` with unit tests for every rule path, Testcontainers ITs per service, ArchUnit, `RealRulebookValidTest`.

**Definition of done:** changing a number in `config/rulebook/v1` changes behaviour after reload with no code change (proved by `RulebookReloadIT`).

---

## Phase 5: Kafka/RabbitMQ eventing, ingest, simulator (11%)

**Goal:** real events flow end to end: simulator → ingest → Kafka → domain services → effect topics, plus scheduled work on RabbitMQ.

**Skills:** `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:systematic-debugging` (async and broker failures), `superpowers:verification-before-completion`, `run` (compose smoke), `code-review`, `simplify`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`.

**Deliverables:** `libs/budokai-contracts` (envelope, schemas, payload records, compat test); `contracts/events/**`; `ingest-service`; Kafka producers/consumers with outbox/inbox in the three domain services; RabbitMQ topology and the `quest.generate-daily` / `quest.evaluate-missed-day` jobs; `tools/simulator` with scenarios; `budokai.*.dlt` handling.

**Tasks**
1. Test: `SchemaExamplesTest` every `examples/valid/*.json` validates and every `examples/invalid/*.json` fails. Write schemas for all v1 types in `EVENT_CONTRACTS.md`.
2. Test: `CompatibilityTest` detects a breaking change inside a major version (fixture pair). Implement the checker.
3. Test: `EnvelopeRoundTripTest` (payload records ↔ JSON). Implement records.
4. ingest-service. Tests first: `HmacVerifierTest` (good, bad, expired timestamp); `IngestControllerIT` (MockMvc + Testcontainers Postgres + Kafka: 202 on valid, 400 on schema error, 401 bad signature, 403 out-of-scope type, duplicate returns 202 and publishes once, backdated beyond window is accepted but flagged `rewardable=false`, future-dated rejected, rejected events land on `budokai.ingest.rejected.v1`). Implement.
5. Kafka in domain services. Tests: `PostureEventConsumerIT` (publish `posture.session.recorded` → `character.stamina.changed` on `budokai.character.effects.v1` with `causationid`); same event twice → one effect; poison message → `.dlt` after retries. Implement listeners, outbox relay to Kafka, `DefaultErrorHandler` with backoff from config.
6. Cross-service choreography IT: `QuestCompletedFlowIT` (quest-service emits `quest.completed` → character awards XP, inventory rolls loot) using Testcontainers Kafka and the three services' Spring contexts (or two ITs per edge if one context is too heavy).
7. RabbitMQ: topology as code (`Declarables`) + `definitions.json` for compose. Tests: `GenerateDailyJobIT` (Testcontainers RabbitMQ + Postgres: one message per user per day, duplicate message is a no-op via unique constraint); `MissedDayJobIT` (TTL delay then evaluation; failure goes to DLQ after N retries from config). ShedLock on schedulers.
8. Simulator. Test: `ScenarioLoaderTest`, `PersonaGeneratorTest` (seeded RNG, realistic distributions from scenario YAML, e.g. posture 3 to 6 sessions/day, Darb funnel ratios); `SimulatorIT` against a WireMock ingest verifies signed requests. Implement; guard: refuses to start without profile `sim` and `REALM_SIMULATOR_ENABLED=true`; events have `budokaimode=simulation`.
9. Scenarios: `config/simulator/scenarios/typical-day.yaml`, `typical-week.yaml`, `typical-month.yaml`, `job-hunt-sprint.yaml`, `neglect-week.yaml`. Add `--report` that prints the XP/level curve for balancing.
10. Compose: ingest and simulator added; Kafka UI shows topics. Smoke: run simulator `typical-day` and see effects on all four effect topics.

**Tests that prove it:** contract tests, ingest ITs, consumer ITs with idempotency and DLT, RabbitMQ job ITs, simulator IT, end-to-end smoke documented in the phase spec.

**Definition of done:** `docker compose --profile apps --profile sim up` and one command produces a day of effects; no duplicate effects on replay.

---

## Phase 6: GraphQL gateway and auth (9%)

**Goal:** a secure public API: identity issues JWTs; the gateway serves the GraphQL schema the Phase 3 prototype already expects; the Angular app switches from fixtures to the real API.

**Skills:** `superpowers:writing-plans`, `superpowers:executing-plans`, `superpowers:test-driven-development`, `security-review` (auth, JWT, HMAC), `playwright-cli` (login e2e), `run`, `superpowers:verification-before-completion`, `code-review`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`.

**Deliverables:** `identity-service`; `gateway-service` with Spring for GraphQL; `contracts/graphql/schema.graphqls`; Angular codegen + Apollo wiring; login screen; service tokens for internal REST.

**Tasks**
1. identity-service. Tests: `PasswordHashingTest` (Argon2id or BCrypt, proposed Argon2id); `TokenServiceTest` (RS256 sign/verify, expiry, claims); `AuthControllerIT` (login, refresh rotation, reuse detection revokes the family, logout); `JwksEndpointIT`; `ProducerKeyIT` (create, scope, rotate, secret shown once). Implement. Seed the single owner account from env (`REALM_OWNER_EMAIL`, `REALM_OWNER_PASSWORD_HASH`), not from code.
2. Service-to-service tokens: client credentials grant in identity; `ServiceTokenFilter` in each service's internal API. Test: internal endpoints reject missing/invalid tokens.
3. Write `schema.graphqls` (Query: `me`, `character`, `questLog(date)`, `mainQuests`, `bosses`, `spellbook`, `dueCards(limit)`, `battleLog(date)`, `skillTree`, `worldMap`, `rulebook`, `producers`; Mutation: `checkInHabit`, `createHabit`, `updateHabit`, `acceptProposedQuest`, `reportRaid`, `equipItem`, `createDeck`, `addCard`, `reviewCard`, `createProducerKey`, `rotateProducerKey`). Test: `SchemaContractTest` (schema parses; every field has a controller mapping via `GraphQlTester` schema inspection).
4. Gateway controllers with HTTP interface clients to services. Tests: `@GraphQlTest` slices per controller with mocked clients; `BatchLoaderTest` proves one downstream call for N quests' items; `QueryLimitsTest` rejects depth > configured max; `SecurityIT` (no token → 401, wrong user's data never returned).
5. Resilience4j timeouts/circuit breakers (values in config). Test: downstream timeout returns a GraphQL error with a stable `extensions.code`.
6. Angular: codegen (`npm run codegen`), Apollo link with auth (access token in memory, refresh via cookie), route guards, login screen. Tests: `auth.store.spec.ts`, interceptor refresh flow; Playwright login → map against the real stack (CI uses compose services, no third-party).
7. Switch every store from fixture link to real link outside demo mode. Test: e2e smoke on real stack with simulator-seeded data.

**Tests that prove it:** identity and gateway ITs, GraphQL slice tests, security ITs, Angular unit + e2e against compose.

**Definition of done:** Nour can log in locally and see simulator data on every Phase 3 screen through GraphQL.

---

## Phase 7: WebSockets live updates and nightly battle log (10%)

**Goal:** effects appear live; each night the battle log compiles and plays on the map.

**Skills:** `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `threejs-choose-skills` then `threejs-camera-controls-and-rigs`, `build-game-camera-controls`, `create-game-vfx`, `threejs-particles-trails-and-effects`, `threejs-visual-validation`, `test-playable-web-games` (replay playback on real data), `animation-systems`, `optimize-web-animations`, `design:ux-copy` (battle-log copy templates), `writing-guidelines`, `playwright-cli`, `run`, `superpowers:verification-before-completion`, `code-review`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`.

**Deliverables:** `notification-service` (STOMP); `battlelog-service` (timelines, nightly compile job, replay scripts, copy templates); Angular live store updates and real battle-log playback.

**Tasks**
1. notification-service. Tests: `StompAuthIT` (CONNECT without/with bad JWT rejected; valid accepted); `EffectFanoutIT` (Kafka effect → message on `/user/queue/effects` for the right user only, using a STOMP test client). Implement with `@EnableWebSocketMessageBroker`, simple broker, user destinations, `ChannelInterceptor` for JWT.
2. battlelog-service timeline. Tests: `TimelineAssemblerTest` (group effects by `causationId` into encounters, order by event time, handle late effects); `TimelineConsumerIT`. Implement.
3. Copy templates `config/copy/en/battlelog.yaml`. Test: `NarratorTest` picks templates by effect type/outcome and fills variables; missing variable fails loudly in tests; every effect type has at least one template (`CopyCoverageTest`).
4. Replay compiler. Tests: `ReplayCompilerTest` golden file (same input + rulebook version → byte-identical JSON matching `contracts/replay/v1.schema.json`); empty day → quiet script. Implement.
5. Nightly job. Tests: `CompileNightJobIT` (scheduler enqueues one job per user at their local `compile_at`, worker compiles, publishes `battlelog.compiled`; retry then DLQ on failure; ShedLock prevents double enqueue). Implement.
6. Gateway: `battleLog(date)` and `battleLogs(range)` fields. Test: slice test.
7. Angular: rx-stomp connection with JWT, reconnect with backoff, effects patch stores, toasts (reduced-motion aware). Tests: `live-effects.store.spec.ts` with a fake STOMP stream; Playwright: simulator emits event → toast appears.
8. Battle Log screen plays real compiled scripts; "Tonight's battle log is ready" notice. Test: e2e with simulator `typical-day` + manual compile trigger (`POST /internal/battlelog/compile?date=` in local profile only).

**Tests that prove it:** STOMP ITs, timeline/narrator/compiler unit + golden tests, job IT, e2e live toast and replay.

**Definition of done:** run simulator for a day, trigger compile, watch the replay on the map; the replay is identical when recompiled.

---

## Phase 8: Recall, SM-2 spells (9%)

**Goal:** Nour studies real decks in Darb Budokai daily; cards become spells that matter in boss fights.

**Skills:** `superpowers:test-driven-development`, `superpowers:executing-plans`, `dataviz` (retention and load charts), `design:accessibility-review` (keyboard review flow), `impeccable:impeccable` (polish the review session), `create-game-vfx` (spell ignition), `playwright-cli`, `superpowers:verification-before-completion`, `code-review`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`.

**Deliverables:** `spellbook-service` (decks, cards, reviews, SM-2, spells), import, GraphQL fields, Spellbook UI wired, spell bonus in quest-service boss fights.

**Tasks**
1. Test: `Sm2SchedulerTest` (textbook cases from the SM-2 description: first/second intervals, EF update per grade, reset on fail, EF floor) and jqwik property tests (EF ≥ min, intervals non-decreasing on passes). Implement with parameters from `spells.yaml`.
2. Test: `SpellStateTest` (unlearned → learned → mastered → fading → restored, thresholds from config). Implement.
3. Flyway schema; `DeckRepositoryIT`, `ReviewServiceIT` (review → schedule update + `card.reviewed` life event + `spell.*` effects via outbox, idempotent on client review id).
4. Nightly fade check (RabbitMQ `spellbook.evaluate-fading`, or part of the day-end job; decide in phase spec). Test: IT emits `spell.faded` once per card per threshold crossing.
5. Import: Markdown (`Q:`/`A:` blocks, tags line) and CSV. Tests: parser tests with malformed input.
6. Daily review caps for XP (config). Test: reviews beyond the cap are scheduled but award nothing.
7. Boss spell bonus in quest-service: consumes `budokai.spellbook.effects.v1` to keep a projection of mastered spells' tags. Test: `BossDamageWithSpellsTest`.
8. Gateway fields (`spellbook`, `dueCards`, `reviewCard`, deck/card mutations). Slice tests.
9. Angular Spellbook wired; keyboard review (Space reveal, 1 to 4 grade); offline-tolerant queue for reviews (retry on reconnect). Tests: store spec; e2e review session; axe.

**Tests that prove it:** SM-2 unit and property tests, spell state tests, ITs, e2e review.

**Definition of done:** Nour imports one real deck and completes a review session; the spells show on the map's Archive and in the battle log.

---

## Phase 9: Darb Scouter integration (5%)

**Goal:** real job-hunt progress from Darb Scouter drives main quests, raids and the final boss.

**Skills:** `superpowers:brainstorming` (enrichment choice with Nour), `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `run` (both stacks together), `superpowers:verification-before-completion`, `code-review`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`.

**Deliverables:** `DarbPoller` connector in ingest-service; mapping config; docs for running both stacks together; optional enrichment.

**Tasks**
1. Re-read Darb Scouter's current `events` table and payloads in `~/Documents/GitHub/darb-scouter` (`backend/src/scouter/db.py`, `repo.py`) and update `EVENT_CONTRACTS.md` if anything changed. Ask Nour whether to enrich with company/title from Darb's tables.
2. Test: `DarbRowMapperTest` (each Darb row type → Darb Budokai CloudEvent; UUIDv5 ids; unknown types skipped and logged; `milestone.earned` mapping). Implement.
3. Test: `DarbPollerIT` (Testcontainers Postgres with Darb's `events` DDL copied as a test fixture; poll picks up new rows from cursor; restart resumes; read-only role; re-poll is idempotent). Implement with the RabbitMQ `ingest.poll-darb` job.
4. Test: `JobHuntFlowIT` end to end: `job.applied` → main quest; `stage.changed` to `tech_interview` → raid; to `offer` → final boss defeated + legendary loot; `rejected` → quest fallen, no loot.
5. Compose: `compose.darb.yml` override documenting how to point `DARB_DB_URL` at Darb's Postgres (host port 5433 in Darb's compose). Credentials from env.
6. Producer registration for Darb in Integrations screen (read-only status, last cursor, errors).
7. Simulator scenario `job-hunt-sprint.yaml` mirrors Darb shapes for demo.

**Tests that prove it:** mapper unit tests, poller IT, job-hunt flow IT, manual run against Nour's local Darb with their permission.

**Definition of done:** with both stacks running locally, changing an application's stage in Darb Scouter shows up on Darb Budokai's Citadel Road within one poll interval.

---

## Phase 10: Hardening (9%)

**Goal:** production-grade confidence: coverage, failure modes, load, security, accessibility.

**Skills:** `security-review`, `code-review`, `simplify`, `superpowers:systematic-debugging`, `performance-profiling`, `optimize-threejs-games`, `threejs-debugging`, `threejs-compatibility-fallbacks`, `optimize-web-animations`, `design:accessibility-review`, `web-design-guidelines`, `audit-reference-originality` (final originality audit of art and copy), `playwright-cli`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `superpowers:receiving-code-review`, `superpowers:finishing-a-development-branch`.

**Tasks**
1. Coverage gate: JaCoCo ≥ 80% line coverage on `libs/*` and domain packages (proposed); web ≥ 70% statements. Add tests where below.
2. Contract tests in CI for every producer/consumer pair (schema examples consumed by each consumer's deserialiser).
3. Failure drills as ITs: Kafka broker restart mid-stream (no loss, no dupes); RabbitMQ unavailable at schedule time (job retried); Postgres connection loss (outbox catches up); poison message → DLT with alert metric.
4. Load: Gatling (Java DSL, proposed) or k6 scripts in `tools/load/`: ingest 200 events/s for 5 minutes on a laptop with p95 < 200 ms for 202 responses (targets proposed); GraphQL `worldMap` p95 < 150 ms. Record results in `docs/LOAD_RESULTS.md`.
5. Security: OWASP Dependency-Check (or `osv-scanner`) in CI; secrets scan (gitleaks) in CI; security headers; CORS allowlist test; JWT `alg` confusion test; HMAC replay test; GraphQL introspection off in non-local; rate-limit tests; run the `security-review` skill over the codebase and fix findings.
6. Accessibility: full keyboard audit by script, axe on all routes, reduced-motion e2e, contrast test, screen reader pass on map summary and battle log (manual notes in `PROGRESS.md`).
7. Frontend performance: bundle budget in `angular.json`, lazy-loaded features, Three.js tree-shaken imports, Lighthouse CI on the main routes.
8. Observability check: `compose.observability.yml` up; one trace spans ingest → Kafka → character → notification; screenshot for docs.
9. Hardcoded-data audit: grep + ArchUnit + manual review of components and services; move anything found to config.

**Tests that prove it:** all of the above green in CI; load results file; security scans clean or findings logged as accepted with reason.

**Definition of done:** CI includes coverage, security scans, contract tests and e2e; no open critical findings.

---

## Phase 11: Docs, demo GIF, public launch (7%)

**Goal:** a recruiter-ready public repo. **Every outward step needs Nour's explicit "yes".**

**Skills:** `writing-guidelines`, `design:design-handoff`, `threejs-visual-validation` (hero shots), `playwright-cli` (demo capture; `browser-video-recording` is also installed), `audit-reference-originality`, `run` (fresh-clone test), `superpowers:verification-before-completion`, `superpowers:finishing-a-development-branch`, `publish-project-to-github` (only after Nour approves going public), `deploy-to-vercel` (only if Nour picks Vercel for the demo frontend).

**Tasks**
1. README rewrite: hero GIF of the battle-log replay, one-paragraph pitch, "skills this proves" table linking to code, architecture diagram, quick start (`docker compose ... up`, simulator, open `localhost:4200`), screenshots, link to zangeel.dev.
2. Record the demo: simulator `typical-week` + compile + replay; capture with Playwright video or the in-app `MediaRecorder` export; convert to an optimised GIF/MP4 (≤ 8 MB). Original content only.
3. `docs/ARCHITECTURE.md` final pass with real diagrams (Mermaid in addition to ASCII), ADR index, `docs/RUNBOOK.md` (start, stop, reset volumes, rotate keys, add a producer).
4. Fresh-clone test: clone into a temp dir, follow README only, everything works. Fix gaps.
5. Final history audit: push checklist over the whole history; `gitleaks detect` over history; confirm GitHub "Contributors" will show only Nour.
6. **Ask Nour**: make the repo public? Pin it on the profile? Tag `v1.0.0` and create a release? Each is a separate yes.
7. Optional (ask): deploy a read-only demo instance in `demo` mode.
8. Update `PROGRESS.md` to 100%; write a short "What's next" (Darb Genki, Capsule, Darb Sennin hooks) in README.

**Tests that prove it:** fresh-clone run, CI green on `main`, push checklist clean over full history.

**Definition of done:** Nour approves the public launch and the README.
