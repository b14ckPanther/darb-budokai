# Open questions for Nour (Phase 1)

Only Nour can decide these. The Phase 1 session asks them **one at a time**, in this order, **open-ended first**: ask the question as written, listen, ask one follow-up if the answer is unclear, and only then mention the proposed default if Nour has no preference. Never send a list of questions in one message.

After each answer: fill in "Answer" with the date, add or update the ADR in `DECISIONS.md`, update the affected doc, and commit every two or three answers.

Format per question: **Q**, why it matters, proposed default (used only if Nour has no preference), answer.

---

## A. What the game is about

### Q1. When you picture opening Darb Budokai at the end of a good day, what do you want to see and feel?
- Why: sets the emotional target for the battle log and the map; everything else is tuned to this.
- Default: a calm, cinematic replay that makes real progress visible, without flattery.
- Answer:

### Q2. Which real daily events matter most to you right now, and which should Darb Budokai ignore?
- Why: decides which rules and producers get built first and weighted most.
- Default: job hunt (Darb Scouter), study (Recall), posture, coding reviews, in that order.
- Answer:

### Q3. What habits would you put in your Quest Log today?
- Why: seeds the quest templates and demo data with real content instead of invented content.
- Default: none seeded; Nour creates habits in the UI. Demo uses neutral examples.
- Answer:

### Q4. How punishing should a missed day be?
- Why: sets the missed-day consequences (fog, stamina, streaks) and whether anything can be lost.
- Default: streak resets, stamina penalty, fog returns to the neglected region; XP and levels never go down.
- Answer:

### Q5. How should self-reported check-ins (no evidence) count?
- Why: the honesty rules. Too strict makes the Quest Log useless; too loose makes the economy fake.
- Default: allowed at a 0.25 multiplier with a small daily cap; a link or artifact raises it to "attested" (0.6).
- Answer:

### Q6. What do the four stats mean to you? Do Vigor, Craft, Lore and Resolve fit, or would you name or split them differently?
- Why: stats appear everywhere in UI and rules.
- Default: Vigor (body/posture), Craft (code), Lore (study), Resolve (job hunt and persistence).
- Answer:

### Q7. What should a rejection from a company do in the game?
- Why: emotionally sensitive; affects the main-quest design.
- Default: the quest closes as "fallen" with a small Resolve XP for closure and no loot; no penalty.
- Answer:

### Q8. Should items and loot only be cosmetic, or can they give small gameplay bonuses?
- Default: mostly cosmetic, small capped modifiers (max 10% on any rate).
- Answer:

## B. Look and feel

### Q9. Describe the world you want to see on the map. Any films, places, materials or moods that feel right (not other games)?
- Why: the art direction is the most important design decision.
- Default: show three directions side by side (UI_DESIGN.md §1: Ember Atlas, Orrery, Ink and Weather), recommend Ember Atlas.
- Answer:

### Q10. Which icon set: Solar duotone (via Iconify) or Lucide?
- Default: Solar duotone for UI controls, custom SVG sigils for game marks.
- Answer:

### Q11. Should Darb Budokai have sound?
- Default: off by default, original procedural sounds, mute toggle.
- Answer:

### Q12. How long should the nightly battle log be, and what time should it be ready?
- Default: 45 to 90 seconds at 1x for a typical day; ready at 23:30 Asia/Jerusalem; playable any time after.
- Answer:

### Q13. Should the battle log narration ever use an LLM, or stay template-only?
- Default: template-only in Darb Budokai; Darb Kaio may add flavour later.
- Answer:

## C. Users, hosting, privacy

### Q14. Is Darb Budokai just for you, or should others be able to sign up?
- Why: decides sign-up flows, multi-tenancy tests and the public demo.
- Default: single owner account seeded from env; data model stays multi-user ready.
- Answer:

### Q15. Where should Darb Budokai run day to day?
- Why: affects deployment, cost and the Darb Genki hand-off.
- Default: locally with Docker Compose on your machine; a read-only public demo in `demo` mode later, only if you want it.
- Answer:

### Q16. What is OK to show publicly in the demo (company names, real applications, real decks)?
- Default: the public demo and GIF use simulator data only; nothing real.
- Answer:

### Q17. Repo name, visibility and licence?
- Default: `b14ckPanther/darb-budokai`, private until Phase 11, MIT licence.
- Answer:

## D. Stack and scope

### Q18. Job ads list Angular 19 and Spring Boot 3. Newer majors exist (Angular 20+, Spring Boot 4). Stay on the versions you listed, or use the latest?
- Default: Angular 19 and Spring Boot 3.5.x as listed in the roadmap; revisit after launch.
- Answer:

### Q19. Event contracts: JSON Schema (proposed) or Avro with a Schema Registry?
- Default: JSON Schema in a CloudEvents envelope (ADR-016).
- Answer:

### Q20. For Darb Scouter, should Darb Budokai read only the `events` table, or also enrich quests with company and role from Darb's other tables?
- Default: events only in Phase 9; enrichment if you agree when we get there.
- Answer:

### Q21. Do you have existing study decks (Anki, Notion, Markdown) to import into Recall?
- Default: Markdown and CSV import; Anki `.apkg` import out of scope unless you need it.
- Answer:

### Q22. Is there anything in this plan you want to drop, add or reorder?
- Answer:
