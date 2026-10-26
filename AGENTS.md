# AGENTS.md

This repo's full agent manual is **`CLAUDE.md`**. Every agent tool (Codex, Cursor, Copilot, Gemini, Aider, others) must read and follow it. The rules below are a summary; if anything differs, `CLAUDE.md` wins.

## Non-negotiable rules

1. **No AI contributors.** "Never add "Co-Authored-By" or any other AI attribution line to commit messages, pull request descriptions, or any other text, in any project. Commit messages end with the last line of the actual description." Every commit is authored and committed as `Nour Alden Mousa <nmcryptoinvest@gmail.com>` (`git config user.name/user.email` set in the repo). Never write the word "claude" in a commit message.
2. **No hardcoded data.** Game rules, curves, loot tables, formulas, thresholds, quest templates, decks, changeable copy and seed content live in `config/**.yaml` or the database. Fixtures only in tests and the labelled `demo` seed mode.
3. **Secrets** only in env vars or git-ignored `.env`; keep `.env.example` current.
4. **No official game or anime IP.** Original or properly licensed assets only (Google Fonts OK). Log third-party assets in `ASSETS.md`.
5. **Ask Nour first** before creating/publicising the GitHub repo, pushing to `main`, merging, publishing or deleting. Commit locally freely. One branch per phase (`phase/NN-name`). Small, honest, working commits.
6. **TDD.** Failing test first, watch it fail, then implement. Testcontainers for Kafka/Postgres/RabbitMQ. No live third-party calls in tests or CI.
7. **Design-first UI** on seed data, Nour approves screen by screen. Responsive, keyboard accessible, `prefers-reduced-motion`, WCAG AA contrast.
8. **Native feel, modern icons, no emoji.** Phone layouts feel like SwiftUI (safe areas, large collapsing titles, bottom tab bar, sheets with detents, springs, pressed-state scale, 44 pt targets, swipe actions). One modern SVG icon set (Solar via Iconify or Lucide) or custom SVG; company logos only via Iconify Simple Icons. Emojis forbidden in UI, notifications, copy, docs and commits; `tools/dev/check-no-emoji.sh` must pass.
9. **UI/UX frontend first:** design system (Phase 2) and clickable prototype (Phase 3) are approved before any backend phase.
10. **Use the installed skills.** Check the skill list before every task, invoke every matching skill with the Skill tool first, and name the skills used in the ledger. Mapping in `CLAUDE.md` §2a and the "Skills:" line of each phase in `docs/PLAN.md`; 3D work starts with `threejs-choose-skills`.
11. **Workflow:** brainstorm → written spec (`docs/specs/`) → plan (`docs/plans/`) → execute with a ledger (`docs/PROGRESS.md`) → whole-branch review → finish.

## Before every push

```bash
git log --format='%an %ae%n%cn %ce' | sort -u          # only: Nour Alden Mousa nmcryptoinvest@gmail.com
git log --format=%B | grep -ciE 'co-authored|claude|anthropic|generated with'   # must be 0
```

## Resume after a reset

Read `CLAUDE.md`, then `docs/PROGRESS.md`, then `git log --oneline -20`, then the current phase in `docs/PLAN.md`.
