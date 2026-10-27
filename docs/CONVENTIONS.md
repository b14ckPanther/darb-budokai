# Conventions

Items not fixed by the roadmap or Nour's rules are confirmed in Phase 1.

## 1. Java and Spring

- Java 21. Use records for DTOs, events and value objects; sealed interfaces for closed hierarchies (effects, specs); pattern-matching `switch` over them; `var` only when the type is obvious.
- Formatting: Spotless with palantir-java-format, enforced in `./mvnw verify` (`./mvnw spotless:apply` to fix). Imports: no wildcards.
- Constructor injection only; no field `@Autowired`. Beans `final` fields.
- Configuration: `@ConfigurationProperties` records with `@Validated`; no `@Value` sprinkled in services. Game data from the rulebook, never from properties files.
- Errors: domain exceptions extend `BudokaiException`; REST errors as RFC 9457 `ProblemDetail`; GraphQL errors with a stable `extensions.code`.
- Transactions at the application-service layer. Domain objects have no Spring annotations.
- Time: inject `java.time.Clock`; never call `Instant.now()` directly in domain code. Store `timestamptz`; compute "the user's day" with the user's `ZoneId`.
- Randomness: inject a seeded `RandomGenerator` from a factory; never `new Random()` in main code (ArchUnit rule).
- Logging: SLF4J, structured key-values (`kv("eventId", id)`), no PII or secrets.
- Nulls: no `null` returns from public methods; use `Optional` for absent single values, empty collections otherwise.

### Package layout (per service)

```
dev.zangeel.budokai.<service>
├── <Service>Application.java
├── domain/          aggregates, value objects, domain services, rule application (pure)
├── application/     use cases, transactions, ports (interfaces)
├── adapter/
│   ├── in/rest/     internal REST controllers
│   ├── in/kafka/    Kafka listeners
│   ├── in/amqp/     RabbitMQ listeners
│   ├── out/persistence/  JPA entities, repositories, mappers
│   └── out/messaging/    outbox writers
└── config/          Spring configuration, properties records
```

ArchUnit enforces: `domain` depends on nothing in `adapter`/`config`/Spring web; adapters do not call each other.

### Naming

- Services: `<domain>-service`; Maven artifact = folder name.
- Topics: `budokai.<domain>.<kind>.v<N>`; queues: `<service>.<job-name>`; event types: `<domain>.<thing>.<past-tense-verb>` (Darb names kept as-is).
- Flyway: `V<N>__<snake_case_description>.sql`; never edit an applied migration.
- Config keys: `snake_case` in YAML rulebook files; `kebab-case` in Spring properties.

## 2. Angular

- Angular 19 standalone components only; `ChangeDetectionStrategy.OnPush`; `input()`, `output()`, `model()`; built-in control flow (`@if`, `@for` with `track`); `inject()` over constructor params.
- State: signals locally; NgRx SignalStore per feature (`withState`, `withComputed`, `withMethods`, `rxMethod` for streams). Components never call Apollo directly; stores do.
- RxJS only at the edges (GraphQL, STOMP, timers); convert to signals with `toSignal` in stores.
- Three.js code lives in `features/world/engine/` as plain TypeScript classes with explicit `dispose()`; no Angular imports there.
- Styles: SCSS with design tokens (`styles/tokens.scss`); no hard-coded colours or durations in component styles; no Tailwind (ADR-030, proposed).
- Lint: angular-eslint + Prettier (`printWidth: 100`, single quotes). `npm run lint` must be clean.
- Copy: user-facing game copy comes from the API (config); structural UI labels in `src/locale/messages.en.json`. No emoji.
- Icons: only through the icon registry (`shared/icons/`), one set plus custom SVG.

### Folder layout

```
web/budokai-web/src/app/
├── core/          auth, apollo, stomp, reduced-motion, error handling
├── shared/        ui components, icons, pipes, tokens.ts
├── features/
│   ├── world/     map page, engine/, map.store.ts
│   ├── character/ skill-tree/ battle-log/ quests/ spellbook/ rulebook/ integrations/
└── demo/          fixture link and seed loaders (demo mode only)
```

## 3. Testing

- Java: JUnit 5 + AssertJ. Unit tests `*Test.java` (Surefire), integration tests `*IT.java` (Failsafe, Testcontainers with `@ServiceConnection`, containers reused per JVM via `budokai-test-support` base classes). Property tests with jqwik.
- Test names describe behaviour: `awardsStaminaPerGoodMinuteUpToDailyCap()`.
- Arrange data with builders in `budokai-test-support` (`aPostureSession().withGoodMinutes(30).build()`), not with production config numbers copied into tests: tests load a test rulebook fixture (`src/test/resources/rulebook/`) so they don't break when Nour rebalances the real one. One `RealRulebookValidTest` covers the real config.
- No `Thread.sleep`; use Awaitility for async assertions.
- No live third-party calls: WireMock for HTTP, Testcontainers for infrastructure, simulator for producers.
- Web: Jest for unit (`*.spec.ts` next to the file), Playwright for e2e (`e2e/*.spec.ts`) with an axe check on every page, run against demo mode or the compose stack.
- Golden files (replay scripts) in `src/test/resources/golden/`; update only with an explicit `-Dgolden.update=true` and a commit that says so.

## 4. Commits

- Imperative mood, plain English, first line ≤ 72 characters, no type prefixes needed, no trailing period. Optional body after a blank line explaining **why**.
- One real working step per commit. Good: `Add SM-2 scheduler with config-driven intervals`. Bad: `wip`, `fix`, `update files`.
- **No AI attribution of any kind.** No `Co-Authored-By`, no "Generated with", no tool names. The message ends with the last line of the actual description.
- Never write the word "claude" in a commit message (the push check greps for it). Refer to the agent manual as "agent manual".
- No emoji in commit messages.
- Author and committer are always `Nour Alden Mousa <nmcryptoinvest@gmail.com>`.
- Never backdate commits.

## 5. Branches

- `main`: always green, only updated by merging a finished phase branch with Nour's approval. Merge locally as Nour and push; never use GitHub's merge buttons (they make GitHub the committer, which the CI guard rejects).
- Phase branches: `phase/NN-short-name` (two-digit phase number), e.g. `phase/05-eventing`.
- Optional sub-branches for parallel work inside a phase: `phase/05-eventing--ingest`, merged back into the phase branch.
- Delete merged branches only after asking Nour.

## 6. Pull request template

Saved as `.github/pull_request_template.md` in Phase 0:

```markdown
## What

<One paragraph: what this phase or change delivers.>

## Why

<The goal from docs/PLAN.md or the spec.>

## How to try it

<Exact commands, e.g. docker compose up, simulator scenario, URL to open.>

## Tests

- [ ] ./mvnw verify
- [ ] npm test / npm run lint / npm run e2e
- [ ] Phase proof tests from docs/PLAN.md

## Screens (UI changes)

<Screenshots desktop and phone. Approved by Nour on YYYY-MM-DD.>

## Checklist

- [ ] No hardcoded game data (rules, numbers, copy in config or DB)
- [ ] Contracts and docs updated (EVENT_CONTRACTS, ARCHITECTURE, .env.example)
- [ ] Keyboard, reduced motion, contrast checked
- [ ] No emoji; one icon set
- [ ] Author check: only Nour Alden Mousa
- [ ] No attribution text in commits or this description
```

The PR description must not contain any AI attribution line, badge or footer.
