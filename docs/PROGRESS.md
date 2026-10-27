# Progress ledger

Agents update this file after **every** task (one row) and at every phase boundary. It is the first thing read after a context reset. `git log` is the truth if they ever disagree; fix this file first.

**Overall:** 15% · **Current phase:** 2 done (merged into `main`) · next: Phase 3 · **Current branch:** `phase/02-design-system` · **Last updated:** 2026-10-27

## Phases

| Phase | Name | Weight | Status | Branch | Commit range | Merged (Nour OK) |
|---|---|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 5% | done | `phase/00-bootstrap` | 1077924..d7a0c02 | Decided by the agent under Nour's delegation (2026-10-26); repo created and `main` pushed after Phase 0 |
| 1 | Brainstorm and spec confirmation | 4% | done | `phase/01-spec` | b2fcb44..00ba7c6 | Decided under Nour's delegation (2026-10-27) |
| 2 | Design system | 6% | done | `phase/02-design-system` | b7cf353..(ledger commit) | Decided under Nour's delegation (2026-10-27) |
| 3 | Frontend prototype on seed data | 12% | not started | `phase/03-ui-prototype` | | |
| 4 | Core domain + rules engine | 13% | not started | `phase/04-core-domain` | | |
| 5 | Eventing, ingest, simulator | 11% | not started | `phase/05-eventing` | | |
| 6 | GraphQL gateway + auth | 9% | not started | `phase/06-gateway-auth` | | |
| 7 | WebSockets + nightly battle log | 10% | not started | `phase/07-live-battlelog` | | |
| 8 | Recall SM-2 spells | 9% | not started | `phase/08-recall-spells` | | |
| 9 | Darb Scouter integration | 5% | not started | `phase/09-darb` | | |
| 10 | Hardening | 9% | not started | `phase/10-hardening` | | |
| 11 | Docs, demo, launch | 7% | not started | `phase/11-launch` | | |

Status values: `not started`, `in progress`, `blocked`, `in review`, `done`.
Overall % = sum of weights of `done` phases + (weight × completed tasks / total tasks) for the phase in progress.

## Task ledger (current phase)

| # | Phase | Task | Status | Skills used | Commits (first..last) | Tests run → result | Notes |
|---|---|---|---|---|---|---|---|
| 0.1 | 0 | Confirm repo name, visibility, licence | done (ruling) | | | | Defaults taken under Nour's delegation: `darb-budokai`, private, MIT (ADR-031) |
| 0.2 | 0 | git init, Nour identity | done | | f7837eb | `git config --get user.email` → nmcryptoinvest@gmail.com | |
| 0.3 | 0 | gitignore, editorconfig, gitattributes | done | | 1077924 | | `brand/node_modules` ignored |
| 0.4 | 0 | commit-msg attribution hook | done | superpowers:test-driven-development, superpowers:verification-before-completion | 9e85fbc..d7a0c02 | tools/dev/test/guards.test.sh → 24 passed | Also rejects emoji (review fix) |
| 0.4b | 0 | check-no-emoji.sh | done | superpowers:test-driven-development, superpowers:verification-before-completion | 9e85fbc | guards.test.sh (emoji cases) | |
| 0.5 | 0 | Agent settings, attribution off | done | | 58c6abc | | |
| 0.6 | 0 | Planning package commit on main | done | | f7837eb | push checklist → only Nour, 0 | |
| 0.7 | 0 | Parent POM, Maven wrapper 3.9.16 | done | superpowers:test-driven-development, superpowers:verification-before-completion | 6a98644 | `./mvnw -v` → Maven 3.9.16, Java 21 | |
| 0.8 | 0 | budokai-test-support: ArchUnit rules, container bases | done | superpowers:test-driven-development, superpowers:verification-before-completion | 6a98644..5173781 | ArchitectureRulesTest 4 + 3 container ITs passed | |
| 0.9 | 0 | character-service skeleton | done | superpowers:test-driven-development, superpowers:verification-before-completion | 64e616f, 9c60ea4..73162e6 | context, health IT (2), ArchUnit (2), env import (2) passed | Health detail test proven by mutation |
| 0.10 | 0 | Compose infra + per-service role | done | superpowers:test-driven-development, superpowers:verification-before-completion, run | 6ccc61f, 867557f | tools/dev/test/compose-smoke.test.sh → 12 passed | Containers stopped after every run |
| 0.11 | 0 | Angular 19 shell, Jest, ESLint, Prettier, Playwright + axe | done | superpowers:test-driven-development, superpowers:verification-before-completion, run | 706a2f3 | npm test 4, lint clean, build ok, e2e 4 passed | e2e font/axe tests proven by mutation |
| 0.12 | 0 | .env.example, gen-keys.sh | done | superpowers:test-driven-development, superpowers:verification-before-completion | 7fcee19, 08ab71c | tools/dev/test/env.test.sh → 15 passed (macOS and Ubuntu) | |
| 0.13 | 0 | CI workflow (guard, java, web, e2e) | done | superpowers:test-driven-development, superpowers:verification-before-completion | d991511, 9754e89, d7a0c02 | YAML valid; scripts pass on Ubuntu container | Not yet run on GitHub (no repo) |
| 0.14 | 0 | LICENSE, CONTRIBUTING, PR template | done | | d328c32 | | |
| 0.15 | 0 | Create GitHub repo and push | done | | | | Repo `b14ckPanther/darb-budokai` (private) exists; `main` and `phase/00-bootstrap` pushed |
| 0.16 | 0 | ADR-019 versions, ledger | done | | 884cd2c | | |
| 0.R | 0 | Whole-branch review | done | superpowers:requesting-code-review, superpowers:receiving-code-review | 08ab71c..d7a0c02 | 1 critical, 4 important fixed; rest ledgered below | |
| 0.Q | 0 | docs/REVIEW_FOR_NOUR.md for Phase 1 | done | | ec507a0 | | 22 questions with recommendations |
| 1.1 | 1 | Answer Q1 to Q22 (delegated) | done | superpowers:brainstorming, writing-guidelines | phase/01-spec | n/a (docs) | 22 answered in OPEN_QUESTIONS.md; changes from the review sheet: Q8, Q9, Q14, Q17, Q22 |
| 1.2 | 1 | Direction mood boards in words + static swatch page | done | frontend-design, design-first-ui-prompting, design-taste-frontend, playwright-cli | phase/01-spec | page rendered at 1440 and 390 px, reviewed | `docs/specs/assets/directions.html` (+ two PNGs); tokens from brand file only |
| 1.3 | 1 | ADRs: accept 016, 020 to 027, 029, 030; add 032 to 037 | done | | phase/01-spec | n/a | ADR-034 no social tournament and cosmetic-only non-core apps; ADR-035 no money |
| 1.4 | 1 | Update GAME_DESIGN, UI_DESIGN, EVENT_CONTRACTS, VISION, ARCHITECTURE, README, CONVENTIONS | done | writing-guidelines | phase/01-spec | check-no-emoji.sh clean | "proposed" labels removed where confirmed |
| 1.5 | 1 | Consolidated spec | done | superpowers:brainstorming | phase/01-spec | n/a | `docs/specs/2026-10-27-phase-01-budokai-spec.md`, approved under delegation |
| 2.1 | 2 | Direction pick (Seal Stone) | done | frontend-design, impeccable:impeccable, design-taste-frontend | this ledger commit | /design screenshots reviewed | ADR-038; Phase 1 swatch page was the side-by-side board |
| 2.2 | 2 | Tokens from config + brand, generator, contrast | done | superpowers:test-driven-development, design:design-system | b7cf353 | 30 contrast pairs AA; drift tests | `hairline-strong` raised to pass 3:1 |
| 2.3 | 2 | Self-hosted fonts, ASSETS.md | done | | e5a872d, 67a7316 | e2e font test | Yuji Boku subset 2.6 KB |
| 2.4 | 2 | Icon pipeline (Solar Bold Duotone + sigils) | done | solar-duotone-bold, superpowers:test-driven-development | b7cf353, 9b09b82 | icons.spec, no-emoji.spec | 44 UI icons, 12 original sigils |
| 2.5 | 2 | Motion tokens, springs, reduced-motion service | done | animation-systems, superpowers:test-driven-development | e5a872d | motion.service.spec 3, spring.spec 4 | Springs emitted as CSS linear() |
| 2.6 | 2 | Base components | done | impeccable:impeccable, frontend-design, superpowers:test-driven-development | d81c3f7 | ui.spec 14, native.spec 10, gestures.spec 9 | |
| 2.7 | 2 | Map look test | done | threejs-choose-skills, threejs, threejs-procedural-materials, threejs-exposure-color-grading, superpowers:test-driven-development | b9c441b | scheduler 3, terrain 2, fallback 1, e2e light levels | Tuned over four rendered passes |
| 2.8 | 2 | /design page, Playwright + axe | done | playwright-cli, design:accessibility-review, web-design-guidelines | 67a7316 | e2e 16 passed (axe zero serious/critical phone and desktop) | Sheet makes the page inert (axe finding) |
| 2.9 | 2 | Approval checkpoint | done (delegated) | design:design-critique, impeccable:impeccable | this ledger commit | screenshots in docs/screenshots/phase-02 | See UI approvals |
| 2.R | 2 | Whole-branch review | done | superpowers:requesting-code-review, superpowers:receiving-code-review | d06e28c | 118 unit, 17 e2e passed | Fresh-context reviewer: 7 important, 5 minor; all fixed (sigil fill, sheet tap and flick, destroy cleanup, scene pause and import race, swipe focus, toast hold) |

Example row:
`| 4.5 | 4 | RuleEvaluator for posture/review/quest | done | superpowers:test-driven-development, superpowers:verification-before-completion | a1b2c3d..e4f5a6b | ./mvnw -pl libs/budokai-rules-core verify → 42 passed | rate values from rulebook v1.0.0 |`

## Rulings (decisions made without Nour)

Every time an agent decides something Nour has not decided. If "cost if wrong" is high, stop and ask instead.

| Date | Phase | Ruling | Why | Cost if wrong (low/med/high + what breaks) | Confirmed by Nour? |
|---|---|---|---|---|---|
| 2026-10-26 | 0 | Repo `darb-budokai`, private, MIT (Q17 defaults) | Proposed defaults; Nour delegated | low: rename or relicense before going public | Delegated (2026-10-26) |
| 2026-10-26 | 0 | Angular 19 + Spring Boot 3.5.16 (Q18 default) | Matches roadmap and job ads | medium: a major upgrade later | Delegated |
| 2026-10-26 | 0 | Jest instead of Karma (ADR-029) | Karma deprecated | low | Delegated |
| 2026-10-26 | 0 | Host ports 54320 / 55672 / 18090 | Other Darb stacks hold 5432 / 5672 / 8090 | low: change in `.env` | Delegated |
| 2026-10-26 | 0 | `init.sh` not `init.sql`; CONNECT revoked from PUBLIC | Passwords from `.env`, never committed | low | Delegated |
| 2026-10-26 | 0 | Latin WOFF2 subsets of brand fonts in the web shell | 5 MB TTF too heavy | low: add subsets later (e.g. CJK for the seal font) | Delegated |
| 2026-10-27 | 1 | Dark theme only in v1 (ADR-036) | The world is a night arena; halves the contrast matrix | low: add a daylight token block later | Delegated |
| 2026-10-27 | 1 | Non-core Darb apps are cosmetic-only integrations (ADR-034) | Keeps the economy honest as the universe grows | low: promote one app by ADR | Delegated |
| 2026-10-27 | 2 | Sheet drag-to-dismiss covered by unit tests plus a manual Chromium probe; the e2e covers only the tap | A scripted e2e drag measured the handle mid-spring and was flaky | low: add a stable drag e2e in Phase 3 | Delegated |
| 2026-10-27 | 0 | Merges into `main` are local only (no GitHub merge button) | GitHub as committer would fail the guard | low | Delegated |

## UI approvals

| Date | Screen | Screenshot path | Nour's verdict | Follow-ups |
|---|---|---|---|---|
| 2026-10-27 | Design system `/design` (desktop and 390 px), map look test at three light levels | `docs/screenshots/phase-02/` | Approved under Nour's delegation | Gold Orrery look for the skill tree in Phase 3 |

## Blockers and waiting on Nour

| Since | What | Asked how | Status |
|---|---|---|---|
| 2026-10-26 | Create GitHub repo `b14ckPanther/darb-budokai` (private) and push | docs/REVIEW_FOR_NOUR.md | done |
| 2026-10-26 | Phase 1 answers (22 questions) | docs/REVIEW_FOR_NOUR.md | done 2026-10-27 under delegation |

### Review findings accepted for later (Phase 0 review, not fixed)

- `check-no-emoji.sh` misses a few default-emoji code points (U+231A/B, U+23E9-23FA, U+25FD/E, U+2B05-2B1C, U+3030, U+303D, U+3297/9) and flags U+200D anywhere, which could trip on Arabic or Indic text. Revisit when copy in those scripts arrives (Phase 2 `no-emoji.spec.ts`).
- ArchUnit rules do not yet catch `Math.random()`, `RandomGenerator.getDefault()`, numeric arrays or `List.of(...)` curves; reading constants runs static initialisers. Harden in Phase 4 when the rules package exists.
- commit-msg hook skips `#` lines, so `--cleanup=verbatim` could slip one past it; the CI guard still catches it.
- compose-smoke shares the dev stack's project name, so its `down` stops a running dev stack.
- The e2e CI job has only run locally (Node 26); first real run comes with the first PR.

## Session log

Short notes per session (2 to 4 lines): what was done, where it stopped, next step.

- 2026-10-26/27: Phase 0 built TDD-first on `phase/00-bootstrap` (19 commits), reviewed in a fresh context, fixes applied, merged into `main` locally under Nour's delegation. Nothing pushed. Next: Nour answers docs/REVIEW_FOR_NOUR.md (or "yes to all") and approves creating the GitHub repo; then Phase 1. 
- 2026-10-27: Phase 1 closed under Nour's delegation on `phase/01-spec`: 22 answers, ADR-032 to ADR-037, spec `docs/specs/2026-10-27-phase-01-budokai-spec.md`, direction swatch page. Next: Phase 2 design system.
- 2026-10-27: Phase 2 on `phase/02-design-system`: tokens generated from config and the brand file, Solar Bold Duotone registry, base components, map look test, `/design` page; 118 unit tests, 17 e2e; review findings fixed. Merged into `main` and pushed. Next: Phase 3 prototype, waiting for Nour's "Continue".
