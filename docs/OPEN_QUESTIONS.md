# Open questions for Nour (Phase 1)

**Status: all answered (Phase 1 closed 2026-10-27).** Nour delegated every answer ("any choice by u will be approved from my side"); each is recorded in `docs/specs/2026-10-27-phase-01-budokai-spec.md` and `docs/DECISIONS.md`, and Nour can overturn any of them.

Only Nour can decide these. The Phase 1 session asks them **one at a time**, in this order, **open-ended first**: ask the question as written, listen, ask one follow-up if the answer is unclear, and only then mention the proposed default if Nour has no preference. Never send a list of questions in one message.

After each answer: fill in "Answer" with the date, add or update the ADR in `DECISIONS.md`, update the affected doc, and commit every two or three answers.

Format per question: **Q**, why it matters, proposed default (used only if Nour has no preference), answer.

---

## A. What the game is about

### Q1. When you picture opening Darb Budokai at the end of a good day, what do you want to see and feel?
- Why: sets the emotional target for the battle log and the map; everything else is tuned to this.
- Default: a calm, cinematic replay that makes real progress visible, without flattery.
- Answer (2026-10-27, decided under Nour's delegation): A calm, cinematic replay that shows real progress plainly and says so when nothing happened. Spec §4.1.

### Q2. Which real daily events matter most to you right now, and which should Darb Budokai ignore?
- Why: decides which rules and producers get built first and weighted most.
- Default: job hunt (Darb Scouter), study (Recall), posture, coding reviews, in that order.
- Answer (2026-10-27, decided under Nour's delegation): Job hunt (Darb Scouter), study (Recall), posture (Darb Juryoku), code reviews (Darb Sennin). The Quest Log needs no producer. Spec §4.2.

### Q3. What habits would you put in your Quest Log today?
- Why: seeds the quest templates and demo data with real content instead of invented content.
- Default: none seeded; Nour creates habits in the UI. Demo uses neutral examples.
- Answer (2026-10-27, decided under Nour's delegation): None seeded for Nour; habits are created in the app. Demo uses neutral examples, none about money. Spec §4.3.

### Q4. How punishing should a missed day be?
- Why: sets the missed-day consequences (fog, stamina, streaks) and whether anything can be lost.
- Default: streak resets, stamina penalty, fog returns to the neglected region; XP and levels never go down.
- Answer (2026-10-27, decided under Nour's delegation): Streak resets, stamina penalty, fog returns to the region; XP and levels never go down. Spec §4.5.

### Q5. How should self-reported check-ins (no evidence) count?
- Why: the honesty rules. Too strict makes the Quest Log useless; too loose makes the economy fake.
- Default: allowed at a 0.25 multiplier with a small daily cap; a link or artifact raises it to "attested" (0.6).
- Answer (2026-10-27, decided under Nour's delegation): 0.25 with a small daily cap; link or artifact makes it attested (0.6); producer-signed is verified (1.0). Spec §4.6.

### Q6. What do the four stats mean to you? Do Vigor, Craft, Lore and Resolve fit, or would you name or split them differently?
- Why: stats appear everywhere in UI and rules.
- Default: Vigor (body/posture), Craft (code), Lore (study), Resolve (job hunt and persistence).
- Answer (2026-10-27, decided under Nour's delegation): Vigor, Craft, Lore, Resolve as proposed. Spec §4.4.

### Q7. What should a rejection from a company do in the game?
- Why: emotionally sensitive; affects the main-quest design.
- Default: the quest closes as "fallen" with a small Resolve XP for closure and no loot; no penalty.
- Answer (2026-10-27, decided under Nour's delegation): Quest closes as fallen, small Resolve XP for closure, no loot, no penalty. Spec §4.7.

### Q8. Should items and loot only be cosmetic, or can they give small gameplay bonuses?
- Default: mostly cosmetic, small capped modifiers (max 10% on any rate).
- Answer (2026-10-27, decided under Nour's delegation): Mostly cosmetic, capped at 0.10 on any rate. Changed: no currency, no shop, items never bought, sold or traded (ADR-035). Spec §4.8.

## B. Look and feel

### Q9. Describe the world you want to see on the map. Any films, places, materials or moods that feel right (not other games)?
- Why: the art direction is the most important design decision.
- Default: show three directions side by side (UI_DESIGN.md §1: Ember Atlas, Orrery, Ink and Weather), recommend Ember Atlas.
- Answer (2026-10-27, decided under Nour's delegation): Changed: Ember Atlas rebuilt on the approved brand as Seal Stone; Gold Orrery kept for the skill tree, Ink and Ki for a later daylight theme (ADR-032). Spec §5.1, swatches in `docs/specs/assets/directions.html`.

### Q10. Which icon set: Solar duotone (via Iconify) or Lucide?
- Default: Solar duotone for UI controls, custom SVG sigils for game marks.
- Answer (2026-10-27, decided under Nour's delegation): Solar, Bold Duotone, bundled from Iconify JSON at build time, plus custom SVG sigils (ADR-033). Spec §5.5.

### Q11. Should Darb Budokai have sound?
- Default: off by default, original procedural sounds, mute toggle.
- Answer (2026-10-27, decided under Nour's delegation): Off by default, mute toggle, original procedural sounds. Spec §4.10.

### Q12. How long should the nightly battle log be, and what time should it be ready?
- Default: 45 to 90 seconds at 1x for a typical day; ready at 23:30 Asia/Jerusalem; playable any time after.
- Answer (2026-10-27, decided under Nour's delegation): 45 to 90 s at 1x, compiled 23:30 owner time zone, replayable any time. Spec §4.9.

### Q13. Should the battle log narration ever use an LLM, or stay template-only?
- Default: template-only in Darb Budokai; Darb Kaio may add flavour later.
- Answer (2026-10-27, decided under Nour's delegation): Template-only; no LLM in Budokai (ADR-025 accepted). Spec §4.9.

## C. Users, hosting, privacy

### Q14. Is Darb Budokai just for you, or should others be able to sign up?
- Why: decides sign-up flows, multi-tenancy tests and the public demo.
- Default: single owner account seeded from env; data model stays multi-user ready.
- Answer (2026-10-27, decided under Nour's delegation): Single owner account from env; data model multi-user ready. No social features (ADR-034). Spec §3.

### Q15. Where should Darb Budokai run day to day?
- Why: affects deployment, cost and the Darb Genki hand-off.
- Default: locally with Docker Compose on your machine; a read-only public demo in `demo` mode later, only if you want it.
- Answer (2026-10-27, decided under Nour's delegation): Locally with Docker Compose; public demo only with Nour's yes in Phase 11. Spec §3.

### Q16. What is OK to show publicly in the demo (company names, real applications, real decks)?
- Default: the public demo and GIF use simulator data only; nothing real.
- Answer (2026-10-27, decided under Nour's delegation): Simulator data only. Spec §3.

### Q17. Repo name, visibility and licence?
- Default: `b14ckPanther/darb-budokai`, private until Phase 11, MIT licence.
- Answer (2026-10-27, decided under Nour's delegation): `b14ckPanther/darb-budokai`, private until Phase 11, MIT for code; brand excluded from reuse. Repo created and `main` pushed after Phase 0. Spec §3.

## D. Stack and scope

### Q18. Job ads list Angular 19 and Spring Boot 3. Newer majors exist (Angular 20+, Spring Boot 4). Stay on the versions you listed, or use the latest?
- Default: Angular 19 and Spring Boot 3.5.x as listed in the roadmap; revisit after launch.
- Answer (2026-10-27, decided under Nour's delegation): Stay on Angular 19 and Spring Boot 3.5.x. Spec §6.

### Q19. Event contracts: JSON Schema (proposed) or Avro with a Schema Registry?
- Default: JSON Schema in a CloudEvents envelope (ADR-016).
- Answer (2026-10-27, decided under Nour's delegation): JSON Schema 2020-12 in CloudEvents 1.0 (ADR-016 accepted). Spec §6.

### Q20. For Darb Scouter, should Darb Budokai read only the `events` table, or also enrich quests with company and role from Darb's other tables?
- Default: events only in Phase 9; enrichment if you agree when we get there.
- Answer (2026-10-27, decided under Nour's delegation): `events` table only in Phase 9; ask about enrichment then. Spec §6.

### Q21. Do you have existing study decks (Anki, Notion, Markdown) to import into Recall?
- Default: Markdown and CSV import; Anki `.apkg` import out of scope unless you need it.
- Answer (2026-10-27, decided under Nour's delegation): Markdown and CSV import; no Anki `.apkg`. Spec §6.

### Q22. Is there anything in this plan you want to drop, add or reorder?
- Answer (2026-10-27, decided under Nour's delegation): Keep the plan and order. Added: no money features, no social tournament, other Darb apps integrate only through optional cosmetic events (ADR-034, ADR-035). Spec §2.
