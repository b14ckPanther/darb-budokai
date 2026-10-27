# Progress ledger

Agents update this file after **every** task (one row) and at every phase boundary. It is the first thing read after a context reset. `git log` is the truth if they ever disagree; fix this file first.

**Overall:** 5% · **Current phase:** 0 done (merged locally into `main`; not pushed) · next: Phase 1 · **Current branch:** `main` · **Last updated:** 2026-10-27

## Phases

| Phase | Name | Weight | Status | Branch | Commit range | Merged (Nour OK) |
|---|---|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 5% | done (local) | `phase/00-bootstrap` | 1077924..d7a0c02 | Decided by Claude under Nour's delegation (2026-10-26); repo not created, nothing pushed |
| 1 | Brainstorm and spec confirmation | 4% | not started | `phase/01-spec` | | |
| 2 | Design system | 6% | not started | `phase/02-design-system` | | |
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
| 0.15 | 0 | Create GitHub repo and push | waiting on Nour | | | | No remote action taken |
| 0.16 | 0 | ADR-019 versions, ledger | done | | 884cd2c | | |
| 0.R | 0 | Whole-branch review | done | superpowers:requesting-code-review, superpowers:receiving-code-review | 08ab71c..d7a0c02 | 1 critical, 4 important fixed; rest ledgered below | |
| 0.Q | 0 | docs/REVIEW_FOR_NOUR.md for Phase 1 | done | | ec507a0 | | 22 questions with recommendations |

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
| 2026-10-27 | 0 | Merges into `main` are local only (no GitHub merge button) | GitHub as committer would fail the guard | low | Delegated |

## UI approvals

| Date | Screen | Screenshot path | Nour's verdict | Follow-ups |
|---|---|---|---|---|
| | | | | |

## Blockers and waiting on Nour

| Since | What | Asked how | Status |
|---|---|---|---|
| 2026-10-26 | Create GitHub repo `b14ckPanther/darb-budokai` (private) and push `main` + `phase/00-bootstrap`; first CI run | docs/REVIEW_FOR_NOUR.md | waiting |
| 2026-10-26 | Phase 1 answers (22 questions, recommendations ready) | docs/REVIEW_FOR_NOUR.md | waiting |

### Review findings accepted for later (Phase 0 review, not fixed)

- `check-no-emoji.sh` misses a few default-emoji code points (U+231A/B, U+23E9-23FA, U+25FD/E, U+2B05-2B1C, U+3030, U+303D, U+3297/9) and flags U+200D anywhere, which could trip on Arabic or Indic text. Revisit when copy in those scripts arrives (Phase 2 `no-emoji.spec.ts`).
- ArchUnit rules do not yet catch `Math.random()`, `RandomGenerator.getDefault()`, numeric arrays or `List.of(...)` curves; reading constants runs static initialisers. Harden in Phase 4 when the rules package exists.
- commit-msg hook skips `#` lines, so `--cleanup=verbatim` could slip one past it; the CI guard still catches it.
- compose-smoke shares the dev stack's project name, so its `down` stops a running dev stack.
- The e2e CI job has only run locally (Node 26); first real run comes with the first PR.

## Session log

Short notes per session (2 to 4 lines): what was done, where it stopped, next step.

- 2026-10-26/27: Phase 0 built TDD-first on `phase/00-bootstrap` (19 commits), reviewed in a fresh context, fixes applied, merged into `main` locally under Nour's delegation. Nothing pushed. Next: Nour answers docs/REVIEW_FOR_NOUR.md (or "yes to all") and approves creating the GitHub repo; then Phase 1. 
