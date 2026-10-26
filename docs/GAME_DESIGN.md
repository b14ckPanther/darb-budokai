# Game design

Fixed by Nour's roadmap: posture sets stamina, Darb Sennin reviews are boss fights, study sessions teach spells, job applications are main quests, an interview is a raid, an offer is the final boss, Quest Log and Recall merge into Darb Budokai, the nightly battle-log replay, and Spring Boot running stats, XP, loot and consequences.

Everything else in this file (stat names, region names, exact mappings, evidence tiers, the shape of the rulebook) is **proposed, confirm with Nour in Phase 1**. Every number in this file is an **example default for the config file**, never a constant in code.

## 1. Core loop

```
real life happens ──► producer emits event (with evidence) ──► ingest validates
      ▲                                                            │
      │                                                            ▼
 Nour sees the map,                                    rules apply (config) in each
 plans tomorrow,     ◄── nightly battle log ◄── effects: stamina, XP, quest progress,
 studies spells           replays the day          loot, spells, boss damage
```

Two loops run in parallel:
- **Live loop:** an effect happens, a toast appears (STOMP), the character sheet updates.
- **Night loop:** at the configured hour, the day compiles into a battle log that replays on the map. This is the signature moment.

## 2. The character

### Stats (proposed)

| Stat | Fed by | Meaning |
|---|---|---|
| **Vigor** | Darb Juryoku, physical habits | Body. Raises max stamina. |
| **Craft** | Darb Sennin reviews, merged work, coding habits | Building things. Raises boss-fight damage. |
| **Lore** | Recall reviews, study sessions, spells mastered | Knowledge. Raises spell power. |
| **Resolve** | Job-hunt stages from Darb Scouter, kept streaks | Persistence. Raises raid resistance and missed-day tolerance. |

Stats grow from stat-XP (each stat has its own track). The character level is derived from total XP. Both curves are config:

```yaml
# config/rulebook/v1/character.yaml (example defaults)
level_curve:   { type: power, base: 120, exponent: 1.45, max_level: 60 }
stat_curve:    { type: power, base: 40,  exponent: 1.30, max_rank: 30 }
stamina:
  max_base: 100
  max_per_vigor_rank: 2
  daily_decay: 15          # stamina lost per day without recovery events
  floor: 10
  exhausted_below: 25      # status "Exhausted"
```

Curve types are a closed set implemented in code (`power`, `linear`, `table`); parameters come from config. No arbitrary expression strings are evaluated from config, except `when` predicates (section 7) which use a restricted evaluator.

### Stamina

- A pool from 0 to max. Refilled by good posture (Darb Juryoku) and rest events; drained by daily decay and by long sessions with bad posture.
- Stamina never blocks recording a real event (you still had the interview). It changes **how the game narrates and rewards** it: when Exhausted, loot rolls use the `exhausted` loot modifier and boss fights deal reduced damage (values in config).

## 3. Mapping real events to game effects

All mappings below live in `config/rulebook/v1/*.yaml`. The "Effect" column is the default proposal.

| Real event (type) | Producer | Game meaning | Effect (defaults in config) |
|---|---|---|---|
| `posture.session.recorded` | Darb Juryoku | Training at the springs | Stamina +0.5 per good minute (cap 40/day). Vigor XP +1 per 10 good minutes. Stamina −0.2 per bad minute beyond 20 in a row. |
| `review.completed` | Darb Sennin | **Boss fight** | Boss HP = sum of finding weights by severity (`critical 40, major 20, minor 5, nit 1`). Resolved findings deal damage. Boss defeated when all `critical` + `major` are resolved. Craft XP by boss tier. Loot from `boss_<tier>` table. |
| `study.session.completed` | Darb Budokai (spellbook) or external | Study at the archive | Lore XP per correct recall (not per minute, so sessions can't be padded). |
| `card.reviewed` | Darb Budokai (spellbook) | Casting practice | SM-2 update (section 5). First correct recall: **spell learned**. |
| `job.applied` | Darb Scouter | **Main quest accepted** | Main quest created, Resolve XP. |
| `stage.changed` → `hr_call` | Darb Scouter | Parley at the gate | Main quest advances, Resolve XP. |
| `stage.changed` → `tech_interview` | Darb Scouter | **Raid** | Raid opens; cleared when the next stage arrives or on manual "raid done" with evidence. Resolve + Craft XP. |
| `stage.changed` → `home_task` | Darb Scouter | Trial dungeon | Dungeon opens; Craft XP on completion. |
| `stage.changed` → `final_interview` | Darb Scouter | Raid at the citadel gate | Raid, larger XP tier. |
| `stage.changed` → `offer` | Darb Scouter | **Final boss defeated** | Legendary loot table, region "Citadel" fully revealed on the map, title earned. |
| `stage.changed` → `rejected` | Darb Scouter | Quest ends | Quest closes as "fallen". Small Resolve XP for closure, **no loot**. |
| `stage.changed` → `withdrawn` | Darb Scouter | Quest abandoned by choice | Quest closes as "set aside". No XP, no penalty. |
| `stage.changed` → `saved` | Darb Scouter | A rumour | Pin on the map only. Saving a listing is not an achievement: no XP. |
| `milestone.earned` | Darb Scouter | Deed | Title or badge from `milestones` table in config; XP only if the milestone maps to a real stage outcome. |
| `habit.checked` | Darb Budokai (Quest Log UI) or Darb Capsule | Daily quest step | Quest progress. Reward scaled by evidence tier (section 8). |
| `plan.week.published` | Darb Kaio | Prophecy | Proposes quests for the week; Nour accepts or rejects them in the Quest Log. No XP for planning. |
| `kinton.portal.opened` | Darb Kinton | Portal | Cosmetic: a portal marker between the device regions on the map. No XP. |

Quest effects consumed by other services: `quest.completed` → character awards XP, inventory rolls loot. `boss.defeated` → inventory rolls `boss_<tier>`. `spell.mastered` → character Lore XP and skill-tree checks.

### Daily quests (Quest Log)

- Templates in `config/rulebook/v1/quests.yaml` (seeded into `quest_db.quest_templates` on startup, versioned). Nour's own habits are created in the UI and stored in the DB.
- `quest.generate-daily` builds the day's quest set from active habits and templates (count and mix in config).
- A quest has an objective type: `count` (e.g. 3 Recall sessions), `duration` (30 good-posture minutes), `event` (a specific event type occurs), or `checkin` (self-reported, lowest tier).

### Missed days and consequences

- `quest.evaluate-missed-day` runs after day end + grace (config). Incomplete dailies become `failed`.
- Consequences (defaults, **severity is an open question for Nour**):
  - Streak resets for that habit.
  - Stamina takes the configured `missed_day_penalty`.
  - The habit's region on the map loses light: **fog returns** in proportion to consecutive misses. Fog lifts as quests are completed again.
  - No XP is ever removed and levels never go down (proposed). The world shows neglect; the character keeps what was earned.

## 4. Loot and items

- Items are mostly **cosmetic or informational** (titles, map banners, character sheet trinkets) with small, capped modifiers (e.g. +5% stamina recovery). Proposed: no item may change XP by more than the cap in `loot.yaml` (`max_item_xp_modifier: 0.10`).
- Loot tables are weighted lists in `config/rulebook/v1/loot.yaml`. Items and their names live in config + `config/copy/en/items.yaml`.
- **Deterministic rolls:** seed = SHA-256(`causationId` + `rulebookVersion` + table id). The same day replays to the same loot. Tested.
- No loot for app opens, logins, check-ins without evidence, or saving a job listing.

## 5. Spells (Recall, SM-2)

### Decks and cards

- Decks and cards are user content in `spellbook_db` (Nour writes them in the UI or imports Markdown/CSV). Demo decks for seed mode live in `config/seed/demo/decks/*.yaml`.
- Each deck maps to a **school** (e.g. a "Spring Security" deck becomes a school of wards). School names and sigils come from config or are user-chosen.
- Cards can carry tags (`concurrency`, `jpa`, `kafka`). Tags matter in boss fights.

### SM-2

Standard SM-2 (Wozniak, 1987). Parameters in `config/rulebook/v1/spells.yaml`:

```yaml
sm2:
  initial_easiness: 2.5
  min_easiness: 1.3
  first_interval_days: 1
  second_interval_days: 6
  pass_grade: 3              # grade < pass_grade resets repetitions
  grade_buttons:             # UI buttons → SM-2 quality (0..5)
    again: 1
    hard: 3
    good: 4
    easy: 5
```

Update per review with quality q (0 to 5):
- If q < pass_grade: repetitions = 0, interval = first_interval_days.
- Else: interval = first (rep 0), second (rep 1), or round(previous_interval × EF); repetitions += 1.
- EF' = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02)), clamped to min_easiness.
- next_due = review date + interval (in the user's timezone).

Property tests (jqwik, proposed) check: EF never below the minimum, intervals never decrease on consecutive passes, a fail always resets.

### Cards to spells

| SM-2 state | Spell state | Shown as |
|---|---|---|
| never passed | Unlearned rune | dim glyph |
| first pass | **Spell learned** (`spell.learned`) | glyph lights |
| interval ≥ `mastery_interval_days` (21) | **Mastered** (`spell.mastered`) | glyph burns steadily, Lore XP |
| overdue by > `fade_after_days` (7) | **Fading** (`spell.faded`) | glyph flickers; power reduced until reviewed |

Fading is the honest picture of forgetting. It is reversed by reviewing the card.

### Spells in boss fights

When a Darb Sennin boss has findings tagged (e.g. `concurrency`), each mastered spell with a matching tag adds `spell_tag_bonus` damage (config) when a matching finding is resolved. Learning is rewarded where it shows up in real work.

## 6. The nightly battle log

1. During the day, battlelog-service appends every effect to the user's `day_timeline`, grouped by `causationId` into **encounters** (one real event and everything it caused).
2. At `battlelog.compile_at` (config, default `23:30`, user timezone; proposed), a `battlelog.compile-night` job is enqueued per user.
3. The worker produces a **replay script**: an ordered list of encounters, each with a map region, a camera path id, effect deltas, loot, and narration lines.
4. Narration comes from templates in `config/copy/en/battlelog.yaml`, selected by effect type and outcome, with variables (`{company}`, `{deck}`, `{findings}`). No LLM (proposed).
5. `battlelog.compiled` is published; the client gets a STOMP notice: "Tonight's battle log is ready."
6. The web client plays the script on the Three.js map (UI_DESIGN.md). A text-only version is always available.

Determinism: same timeline + same rulebook version = byte-identical script. Tested with a golden file.

Empty days are honest: "The budokai was quiet today." No invented fights.

## 7. The rules engine

Lives in `libs/budokai-rules-core`, used by every domain service for its slice of the rulebook.

- **Model:** `Rule(id, on: eventType + version, when: predicate?, effects: List<EffectSpec>)`. `EffectSpec` is a sealed interface (`AwardXp`, `AdjustStamina`, `ProgressQuest`, `OpenBoss`, `DamageBoss`, `RollLoot`, `GrantTitle`, ...). Each service handles only its own effect kinds.
- **Predicates:** a small, safe expression language over the event payload. Implementation: Spring SpEL with `SimpleEvaluationContext.forReadOnlyDataBinding()` (no type references, no method calls on arbitrary beans). Example: `payload.goodMinutes >= 10`.
- **Amounts:** `{ per: goodMinutes, rate: 0.5, cap_per_day: 40 }`, `{ fixed: 25 }`, `{ table: boss_xp, key: tier }`. Never expressions.
- **Purity:** `RuleEvaluator.evaluate(event, state, rulebook) → List<Effect>` is a pure function. Services load state, call it, persist the result. This makes rules unit-testable without Spring.
- **Validation:** `rulebook.schema.json` validates the YAML at startup; a test loads the real `config/rulebook/v1` and checks every rule references a known event type and a known effect kind.
- **Versioning:** `rulebook/v1/meta.yaml` has `version: 1.0.0`. Any change bumps it. Effects record it.

Example:

```yaml
# config/rulebook/v1/character.yaml
rules:
  - id: posture-stamina
    on: posture.session.recorded@1
    when: "payload.goodMinutes > 0"
    effects:
      - adjust_stamina: { per: goodMinutes, rate: 0.5, cap_per_day: 40 }
      - award_stat_xp:  { stat: vigor, per: goodMinutes, rate: 0.1 }
```

## 8. Honesty and anti-cheat

The game only rewards real, evidence-backed events.

### Evidence tiers (`config/rulebook/v1/evidence.yaml`, proposed)

| Tier | Example | Reward multiplier | Daily cap |
|---|---|---|---|
| `verified` | Darb stage read from Darb DB; Darb Sennin review from a PR; Darb Juryoku sensor session signed by its producer key | 1.0 | none |
| `attested` | A check-in with a link or artifact (commit URL, certificate, screenshot hash) | 0.6 | config |
| `self_reported` | A tap in the Quest Log with no evidence | 0.25 | config (small) |
| `simulated` | Simulator events | 1.0, but only for the simulated user | n/a |

### Rules

- Every event must carry `budokaievidence` (tier + reference). Missing evidence = rejected, logged to `budokai.ingest.rejected.v1`.
- Idempotency: event `id` plus a natural key per type (e.g. `applicationId + toStage`). Duplicates are acknowledged and ignored.
- Backdating: events older than `max_backdate_hours` (72) are stored and shown but award nothing.
- Future-dated events are rejected.
- Stage regressions in Darb (e.g. `offer` → `applied`) do not re-award.
- Per-type daily caps stop farming (e.g. 50 Recall reviews/day count toward XP; more are allowed but give no XP).
- Producer keys are scoped: Darb Juryoku's key can only send `posture.*`.
- No reward for app opens, logins, viewing the battle log, or editing the rulebook.
- The **Rulebook screen** in the app shows the active config read-only, so the rules are inspectable.

## 9. Balancing principles

1. **A good real day should feel good; an empty day should look empty.** Target (config-tuned, verified with the simulator): a typical active day ≈ 1 level per 7 to 10 days early on, slowing later.
2. **Outcomes over effort-padding.** Reward correct recalls, resolved findings and stage changes, not minutes logged or buttons pressed.
3. **Big moments are rare and real.** Final boss (offer) is the largest single reward and cannot be farmed.
4. **Diminishing returns** via daily caps, not hidden decay.
5. **No permanent punishment.** Fog and stamina loss show neglect; earned XP and levels stay (proposed).
6. **Every number is tunable.** Balancing = editing YAML + running `simulator --scenario=typical-month --report` to see the curve, never a code change.
7. **Inspectable.** If Nour can't explain why they got 37 XP by reading the battle log line and the rulebook, the design is wrong.

## 10. The map (game view)

Regions (proposed names, original, config in `map.yaml`): **The Springs** (Vigor), **The Forge** (Craft), **The Archive** (Lore), **The Citadel Road** (Resolve, job quests leading to the Citadel), and **The Wilds** (unclaimed, revealed by skill-tree unlocks). Each region has a light level driven by recent activity, and fog driven by neglect.
