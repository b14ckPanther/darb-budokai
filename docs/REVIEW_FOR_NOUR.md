# Phase 1 review for Nour

**Closed 2026-10-27.** Decided under Nour's delegation; answers in `docs/OPEN_QUESTIONS.md`, the spec in `docs/specs/2026-10-27-phase-01-budokai-spec.md`, and the changed items (Q8, Q9, Q14, Q17, Q22) in `docs/DECISIONS.md` (ADR-032 to ADR-037).

Every open question from `docs/OPEN_QUESTIONS.md` that Phase 1 must settle, with a recommended
answer and one line of why. Reply **"yes to all"**, or name the numbers you want to change.
Nothing here is final until you answer; Phase 1 then records each answer as an ADR.

## A. What the game is about

| Q | Question | Recommendation | Why |
|---|---|---|---|
| 1 | What should a good day feel like? | A calm, cinematic replay that shows real progress plainly, never flattery. | Honest reward is what makes you open it again tomorrow. |
| 2 | Which real events matter most? | Job hunt (Darb Scouter), then study (Recall), posture, code reviews. | Matches where your time and goals are now; the order sets build priority. |
| 3 | Habits for the Quest Log? | Seed none; you add your own habits in the app. Demo uses neutral examples. | Real habits stay private and you are not locked into invented ones. |
| 4 | How punishing is a missed day? | Streak resets, small stamina penalty, fog returns to that region. XP and levels never go down. | Visible consequence without the despair that makes people quit. |
| 5 | How do self-reported check-ins count? | Allowed at 0.25x with a small daily cap; a link or artifact raises it to 0.6x. | Keeps the Quest Log useful while proof stays worth more. |
| 6 | The four stats? | Keep Vigor (body), Craft (code), Lore (study), Resolve (job hunt and persistence). | Each maps to one real stream, so every number has a clear source. |
| 7 | What does a rejection do? | Quest closes as "fallen", small Resolve XP for closure, no loot, no penalty. | Rewards facing it; never punishes you for a company's decision. |
| 8 | Cosmetic or gameplay loot? | Mostly cosmetic; small capped bonuses (max 10% on any rate). | Loot feels real without breaking the economy. |

## B. Look and feel

| Q | Question | Recommendation | Why |
|---|---|---|---|
| 9 | The world on the map | Ember Atlas, re-tuned to the approved brand: night stone, gold, ki-orange light. | Closest to the 武 seal and tournament-stone brand you already chose. |
| 10 | Icon set | Solar duotone (via Iconify) for UI, custom SVG sigils for game marks. | Duotone suits the gold-on-night look; one consistent set. |
| 11 | Sound? | Off by default; original procedural sounds; mute toggle. | Respectful by default, still there for the battle-log moment. |
| 12 | Battle log length and time | 45 to 90 seconds at 1x; ready at 23:30 Asia/Jerusalem; replayable any time. | Short enough to watch nightly; ready before sleep. |
| 13 | LLM narration? | Template-only in Darb Budokai; Darb Kaio may add flavour later. | Deterministic, free, testable; no paid API. |

## C. Users, hosting, privacy

| Q | Question | Recommendation | Why |
|---|---|---|---|
| 14 | Just you, or sign-ups? | Single owner account from env; data model stays multi-user ready. | No sign-up work now, nothing blocks it later. |
| 15 | Where does it run? | Locally with Docker Compose; read-only public demo later only if you want it. | Zero cost; your data stays on your machine. |
| 16 | What can the public demo show? | Simulator data only; no real companies, applications or decks. | Protects you and the companies you apply to. |
| 17 | Repo name, visibility, licence | Already ruled in Phase 0: `b14ckPanther/darb-budokai`, private until Phase 11, MIT. Repo not created yet. | Matches the default; change any part with one word. |

## D. Stack and scope

| Q | Question | Recommendation | Why |
|---|---|---|---|
| 18 | Angular 19 / Spring Boot 3.5, or newer? | Stay on Angular 19 and Spring Boot 3.5.x (Phase 0 is built on them); revisit after launch. | Matches the job ads; upgrading later is a contained phase. |
| 19 | JSON Schema or Avro? | JSON Schema in a CloudEvents envelope (ADR-016). | Readable from every sibling language; no registry to run. |
| 20 | Darb Scouter data scope | `events` table only in Phase 9; enrichment later if you agree then. | Smallest coupling between the two projects. |
| 21 | Existing decks to import? | Markdown and CSV import; Anki `.apkg` only if you need it. | Covers most sources at low cost. |
| 22 | Drop, add or reorder anything? | Keep the plan as is (UI first: Phases 2 and 3 before any backend). | The order already protects the design-first rule. |

## Also waiting on you (outside Phase 1)

- Creating the GitHub repo and the first push (Phase 0 step 15). Command, when you say yes:
  `gh repo create b14ckPanther/darb-budokai --private --source . --remote origin`, then push
  `main` and `phase/00-bootstrap`. CI runs on that first push.
