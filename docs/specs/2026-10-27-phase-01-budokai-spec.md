# Phase 1 spec: Darb Budokai v1

Status: **Approved.** Decided under Nour's delegation (2026-10-27). Nour wrote: "any choice by u will be approved from my side". The delegation covers product, spec and design choices and local merges. It does not cover creating repos, changing visibility, deploying, publishing or spending money; those still wait for Nour's yes.

Nour can veto any line below. Each section names the questions it answers (`Q1` to `Q22` from `docs/OPEN_QUESTIONS.md`) and the ADRs it settles. Where the answer differs from the recommendation in `docs/REVIEW_FOR_NOUR.md`, the section says so and `docs/DECISIONS.md` records it as "Decided under Nour's delegation".

## 1. What it is

Darb Budokai is the RPG that Nour's real life plays. Real, evidence-backed events from the day (a job application, an interview, a study review, a posture session, a code review, a habit kept) become game effects in a living world: stamina, XP, quests, bosses, raids, loot, spells and fog. Each night the day plays back as a short battle log across a 3D map.

Tagline (from the approved brand): **"Your real life is the tournament."** The tournament is a metaphor for one person's days: each good day is a round won against yesterday. It is never a contest against other people (section 3).

Two audiences, in this order:

1. **Nour, every day, on phone and desktop.** If it flatters, nags, or feels like a habit tracker in costume, it has failed (VISION anti-goals).
2. **A recruiter in 30 seconds.** The README GIF shows the battle log on the map; the repo shows Java 21, Spring Boot, Kafka, RabbitMQ, GraphQL, STOMP, Angular and Three.js doing real work.

## 2. Scope boundaries (Q22; new constraints)

These are fixed for v1 and enforced in reviews:

- **No money features of any kind.** No in-game currency, coins, shop, prices, trading, purchases, budgets, savings goals, revenue or finance tracking, and no producer that sends financial data. Loot is earned only from real events and is never bought or sold. Demo seed habits never mention money.
- **No social tournament.** No other players, leaderboards, rankings, PvP, friends, guilds, chat or shared brackets. One owner account (Q14). "Tournament" is the brand metaphor only.
- **Sibling integrations are optional.** Budokai is complete on its own: the Quest Log and Recall produce every kind of effect without any other Darb app running. Each producer can be switched off in Integrations and the game still works.
- **Two kinds of sibling events.**
  - *Core producers named in the roadmap* (Darb Scouter, Darb Juryoku, Darb Sennin) may award XP, stamina and loot through the rulebook, because the roadmap fixes those mappings.
  - *Every other Darb app* integrates through **optional cosmetic events only**: they change how the world looks (a marker, a banner, a light) and never award XP, stamina, loot or quest progress. The template is `kinton.portal.opened` v1 (a portal marker between device regions). Darb Kaio's `plan.week.published` stays a proposal list that Nour accepts or rejects; it awards nothing.

## 3. Players and hosting (Q14, Q15, Q16, Q17)

- **Single owner account** seeded from env (`REALM_OWNER_EMAIL`, password hash). No sign-up flow. The data model keeps `userId` on every record so nothing blocks more users later, but v1 tests only one.
- **Runs locally** with Docker Compose. A read-only public demo in `demo` mode is a Phase 11 option that needs Nour's yes.
- **Public demo and GIF use simulator data only.** No real companies, applications, decks or habits.
- **Repo:** `b14ckPanther/darb-budokai`, private until Phase 11, MIT licence for code. The brand (name, 武 mark, renders) is not licensed for reuse as another product's brand; `ASSETS.md` says so. *Changed from the review sheet:* the repo now exists and `main` is pushed (done after Phase 0).

## 4. The game

### 4.1 Feeling (Q1)

A calm, cinematic replay that makes real progress visible and says plainly when nothing happened ("The arena was quiet today."). No praise without evidence, no confetti, no streak insurance.

### 4.2 Event priority (Q2)

Build and weighting order: job hunt (Darb Scouter), study (Recall), posture (Darb Juryoku), code reviews (Darb Sennin). The Quest Log is always on and needs no producer.

### 4.3 Habits (Q3)

None seeded for Nour. Nour creates habits in the app. Demo mode uses neutral examples from `config/seed/demo/` (for example "Stretch for ten minutes", "Read one chapter", "Walk outside"), none about money.

### 4.4 Stats (Q6)

Vigor (body, posture), Craft (code), Lore (study), Resolve (job hunt and persistence). Each maps to one real stream, so every number has a source. Stat names, descriptions and curves live in config.

### 4.5 Missed days (Q4)

Streak resets for that habit, a stamina penalty (`missed_day_penalty` in config), and fog returns to that habit's region in proportion to consecutive misses. **XP and levels never go down.** Fog lifts when quests there are completed again.

### 4.6 Evidence (Q5)

Self-reported check-ins count at 0.25 with a small daily cap; a link or artifact raises them to `attested` (0.6); producer-signed events are `verified` (1.0). All multipliers and caps live in `config/rulebook/v1/evidence.yaml`. The UI always shows the tier as a badge with text and shape, not colour alone.

### 4.7 Rejection (Q7)

The main quest closes as "fallen", with a small Resolve XP for closure, no loot, no penalty. Copy is plain and kind, never mocking: the company decided, Nour did not lose.

### 4.8 Loot (Q8)

Items are mostly cosmetic or informational (titles, banners, trinkets on the character sheet) with small capped modifiers: no item changes any rate by more than `max_item_modifier` (0.10) in `loot.yaml`. *Clarified from the review sheet:* there is no currency and no shop (section 2); items are only dropped by real events and can only be equipped, never bought, sold or traded. Rarity is shown by shape and a word, never by a rainbow of colours.

### 4.9 Battle log (Q12, Q13)

45 to 90 seconds at 1x for a typical day, compiled at 23:30 in the owner's time zone (default `Asia/Jerusalem`, both in config), replayable any time after. Narration is template-only from `config/copy/en/battlelog.yaml`: deterministic, free and testable. No LLM in Budokai.

### 4.10 Sound (Q11)

Off by default, a mute toggle always visible in Settings, original procedural sounds only (`procedural-sfx`), never autoplay.

## 5. Look and feel

### 5.1 Art direction (Q9; ADR-032)

*Changed from the review sheet:* "Ember Atlas" is renamed and rebuilt on the approved brand as **Seal Stone**: the arena floor at night, dark tiled stone carved into relief, gold contour lines like an engraved survey, forest panels, and ki orange glowing only from cracks where real events landed. Neglect is pale stone dust (fog) settling over a region.

The approved brand fixes fonts and palette, so the three UI_DESIGN candidates are shown as brand-faithful variants (`docs/specs/assets/directions.html`): **A. Seal Stone** (recommended), **B. Gold Orrery** (regions as stone plates on gold rails; kept as the look of the skill tree), **C. Ink and Ki** (ink wash on ivory; kept as a possible daylight theme later). Phase 2 confirms the pick on screen.

### 5.2 Type

Fixed by the brand: **Zen Antique** for display headings (large sizes only), **Geist** for all interface text and numbers (tabular figures for stats, XP and times), **Yuji Boku** for the 武 seal and the Japanese name only. All SIL OFL, self-hosted as subsets. This supersedes the UI_DESIGN draft (Cormorant, Inter Tight, JetBrains Mono).

### 5.3 Colour

Fixed by the brand palette (`brand/src/tokens.json`): night, forest, gold, gold light, gold deep, ki, ki hot, stone, ivory, ink, muted. Rules: ki orange is energy only (glows, cracks, ember light), never text; gold means progress and earned things. Phase 2 adds the few semantic colours the brand lacks (danger, fog, verified) in `config/design/tokens.yaml`, each contrast-tested. The UI_DESIGN draft palette (`--ink-950`, `--ember-400` and so on) is superseded.

### 5.4 Theme

**Dark only in v1.** The world is a night arena and the map reads only in the dark; a light theme would double the contrast matrix for a screen Nour mainly opens in the evening. Tokens are grouped by theme so a daylight theme (from direction C) can be added later as one token block. Cost if wrong: low.

### 5.5 Icons (Q10)

**Solar, Bold Duotone style**, via Iconify JSON bundled at build time (no runtime CDN), plus original SVG sigils for game marks (stats, evidence tiers, spell schools, rarity shapes). Duotone suits gold on night; one consistent set. Solar is CC BY 4.0, credited in `ASSETS.md`. Real company logos on main quests only via Iconify Simple Icons, otherwise a monogram.

### 5.6 Native feel

As in UI_DESIGN §1b: safe areas, large titles that collapse, a bottom tab bar on phones and a side rail on desktop (Map, Quests, Spellbook, Character, Log), sheets with detents and drag-to-dismiss, spring physics from tokens, pressed-state scale, 44 px targets, translucent bars with a solid fallback under `prefers-reduced-transparency`. No emoji anywhere.

## 6. Architecture and stack (Q18, Q19, Q20, Q21)

- **Versions:** Angular 19.2 and Spring Boot 3.5.x stay (Phase 0 is built on them); revisit after launch.
- **Contracts:** JSON Schema 2020-12 inside a CloudEvents 1.0 envelope (ADR-016 accepted). No Schema Registry.
- **Darb Scouter:** the `events` table only in Phase 9; enrichment with company and role is asked again then.
- **Recall import:** Markdown and CSV. Anki `.apkg` is out of scope.
- **Angular change detection:** zone.js stays (zoneless is still experimental in Angular 19); the Three.js engine runs outside Angular's zone.
- All other Proposed ADRs (016, 020 to 027, 029, 030) are accepted as written.

## 7. Out of scope for v1

Money or finance features, social or competitive features, sign-ups, native mobile app (that is Darb Capsule), LLM narration, Anki import, a light theme, Kubernetes, paid services.

## 8. Left to the builder

Exact copy (Phase 3, `design:ux-copy`), spring values (Phase 2 tokens), the few semantic colours the brand lacks (Phase 2, contrast-tested), XP and loot numbers (Phase 4 rulebook, tuned with the simulator), and per-screen layouts (Phase 3, approved screen by screen).
