# Progress ledger

Agents update this file after **every** task (one row) and at every phase boundary. It is the first thing read after a context reset. `git log` is the truth if they ever disagree; fix this file first.

**Overall:** 0% · **Current phase:** 0 (not started) · **Current branch:** none · **Last updated:** YYYY-MM-DD

## Phases

| Phase | Name | Weight | Status | Branch | Commit range | Merged (Nour OK) |
|---|---|---|---|---|---|---|
| 0 | Repo bootstrap, CI, conventions | 5% | not started | `phase/00-bootstrap` | | |
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
| 0.1 | 0 | Confirm repo name, visibility, licence with Nour | not started | | | | |

Example row:
`| 4.5 | 4 | RuleEvaluator for posture/review/quest | done | superpowers:test-driven-development, superpowers:verification-before-completion | a1b2c3d..e4f5a6b | ./mvnw -pl libs/budokai-rules-core verify → 42 passed | rate values from rulebook v1.0.0 |`

## Rulings (decisions made without Nour)

Every time an agent decides something Nour has not decided. If "cost if wrong" is high, stop and ask instead.

| Date | Phase | Ruling | Why | Cost if wrong (low/med/high + what breaks) | Confirmed by Nour? |
|---|---|---|---|---|---|
| | | | | | |

## UI approvals

| Date | Screen | Screenshot path | Nour's verdict | Follow-ups |
|---|---|---|---|---|
| | | | | |

## Blockers and waiting on Nour

| Since | What | Asked how | Status |
|---|---|---|---|
| | | | |

## Session log

Short notes per session (2 to 4 lines): what was done, where it stopped, next step.

- YYYY-MM-DD: 
