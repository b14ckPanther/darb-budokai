# UI design

Fixed by Nour's roadmap: Angular + Three.js world map, character sheet, skill tree, nightly battle-log replay. Quality bar: "jaw-dropping", cinematic, never childish or template-looking.

The art direction, palette, fonts, region names and screen layouts below are **confirmed in Phase 1 (2026-10-27, under Nour's delegation; see `docs/specs/2026-10-27-phase-01-budokai-spec.md`)** (the art direction is the most important Phase 1 question after the core events). Phase 2 turns the approved direction into a design system; Phase 3 builds every screen as a clickable prototype on seed data, approved one screen at a time. Both come before any backend work.

## 1. Art direction

Phase 1 shows Nour three candidate directions side by side; Phase 2 builds the chosen one. "Ember Atlas" is the recommended default and is described in full below.

### Phase 1 outcome (2026-10-27, ADR-032, ADR-036)

The approved brand ("The Seal") fixes the fonts and palette, so the candidates below were rebuilt as brand-faithful variants in `docs/specs/assets/directions.html`: **A. Seal Stone** (Ember Atlas on the brand; chosen for the world), **B. Gold Orrery** (kept for the skill tree), **C. Ink and Ki** (kept for a possible daylight theme). The palette and type sections further down are the pre-brand drafts and are **superseded**: colours come from `brand/src/tokens.json` plus contrast-tested semantic additions in `config/design/tokens.yaml`; type is Zen Antique (display), Geist (interface and numbers) and Yuji Boku (seal only). v1 is dark only. Icons: Solar Bold Duotone (ADR-033).

### Candidate directions (original drafts)

| Direction | One line | Map look | Risk |
|---|---|---|---|
| **A. Ember Atlas** (recommended) | A night cartographer's table lit by embers where real life happened | Dark relief terrain with contour-line shader, ember glow, fog of neglect | Must avoid looking like a generic "dark fantasy" UI; keep chrome restrained |
| **B. Orrery** | The budokai as a brass-and-glass instrument; regions are rings and plates that light and turn | Floating tiered plates connected by thin rails, a slow orbit of the day's encounters | Can drift toward "sci-fi dashboard"; needs a warm material palette |
| **C. Ink and Weather** | A living ink-wash landscape where weather is your state: stamina is clear sky, neglect is rain and mist | Monochrome ink terrain with one accent colour; weather particles carry meaning | Low colour range makes status harder to read; needs strong shape and text cues |

All three are original, cinematic, and avoid any existing game or anime look.

### Ember Atlas in detail

A night-time cartographer's table brought to life. The world is a dark relief map drawn in fine contour lines, lit from inside by embers where real life happened today. Think surveying instruments, ink, brass and firelight, not cartoons.

- **Mood:** quiet, cinematic, a little mysterious. Light is the reward: activity lights regions; neglect brings fog.
- **Map:** low-poly terrain generated from a heightmap (procedural, in repo), rendered with contour-line shading (a custom shader that draws iso-lines on the terrain) over deep ink. Regions are subtle tints, never bright fills. Landmarks are simple sculpted silhouettes (forge, archive tower, springs, citadel) built from primitives or original low-poly models made for this repo.
- **Light and fog:** each region has a light level (recent activity) and a fog density (missed days), both from `region.fog.changed` and live effects. Embers drift up from active regions.
- **UI chrome:** thin brass hairlines, engraved-style section labels, generous dark space. Panels are near-opaque ink with a faint paper grain, not glassmorphism.
- **Iconography:** one modern SVG icon set for UI controls (Solar Bold Duotone via Iconify, ADR-033) plus original line glyphs (spell sigils, stat marks) drawn as SVG in repo. No icon packs that look like a known game, no raster clip-art, no mixed styles.
- **What to avoid:** cartoon characters, chibi avatars, rounded bubbly buttons, rainbow rarity colours, confetti, default Material/Bootstrap look, anything resembling a known game or anime.

### Palette (pre-brand draft, superseded by ADR-036)

| Token | Hex | Use |
|---|---|---|
| `--ink-950` | `#0A0D12` | page background |
| `--ink-900` | `#10151C` | panels |
| `--ink-700` | `#1E2631` | raised surfaces, borders |
| `--bone-100` | `#ECE6D8` | primary text (≈15:1 on ink-950) |
| `--bone-300` | `#B9B2A3` | secondary text (≈8:1) |
| `--ember-400` | `#F08A4B` | primary accent, active light, focus ring |
| `--brass-400` | `#C9A45C` | hairlines, headings accents |
| `--verdigris-400` | `#4FB3A0` | Lore / spells, success |
| `--blood-400` | `#E0645C` | damage, failure (always with an icon and text, never colour alone) |
| `--fog-500` | `#5B6676` | fog, disabled |

Every text/background pair must meet WCAG AA (4.5:1 body, 3:1 large text and UI components). Phase 2 adds an automated contrast test over the token pairs.

### Type (pre-brand draft, superseded by ADR-036)

- Display: **Cormorant** (engraved, cinematic headings; used large only).
- UI and body: **Inter Tight** or **IBM Plex Sans**.
- Numbers and logs: **JetBrains Mono** (tabular figures for stats and timestamps).

Self-host the font files (downloaded once, licences recorded in `ASSETS.md`).

### Sound (off by default, confirmed in Phase 1)

Off by default. Procedurally generated in repo (Web Audio): a low ember crackle, a soft chime for a spell, a struck-metal hit for boss damage. Respect a mute toggle and never autoplay.

## 1b. Native feel, icons, no emoji

Nour: "the apps must feel as native as a SWIFT UI when it comes to mobile apps... use only modern elements and icons and SVGs ... emojis and low quality icons are forbidden".

On a phone, budokai-web must feel like a SwiftUI app, not a shrunken website:

- **Safe areas:** `viewport-fit=cover` and `env(safe-area-inset-*)` padding on bars, sheets and the map HUD.
- **Large titles** on list screens (Quest Log, Spellbook, Inventory) that collapse into a compact translucent top bar on scroll.
- **Bottom tab bar** with five destinations: Map, Quests, Spellbook, Character, Log. Desktop uses a side rail with the same destinations.
- **Sheets** with detents (medium, large) and drag-to-dismiss for region panels, quest details, item details and card editing. Implemented with Angular CDK overlay + pointer events; no third-party UI kit look.
- **Spring physics**, not linear easing, for sheets, tab switches, pressed states and HUD counters (spring presets in tokens; reduced motion replaces them with short fades).
- **Pressed-state feedback:** buttons and rows scale to 0.97 with a spring on press.
- **Touch targets:** 44 pt minimum.
- **Materials:** system-like translucent bars and sheets (`backdrop-filter: blur()` over ink, with an opaque fallback when `prefers-reduced-transparency` or no support).
- **Native-style lists** with swipe actions (swipe a daily quest to check in; swipe a card to suspend), always with a visible button alternative for keyboard and screen readers.
- Darb Capsule (Flutter, separate project) uses Cupertino-quality widgets on iOS, not stock Material defaults.

**Icons:** one consistent modern SVG set only: Solar duotone via Iconify (skill `solar-duotone-bold`) or Lucide, plus custom-drawn SVG sigils. Real company logos on Darb main quests come only from Iconify Simple Icons (skill `company-logos`); unknown companies get a monogram, never a scraped raster logo.

**No emoji, anywhere:** not in UI strings, toasts, notifications, battle-log copy, config copy, docs or commits. Low-quality, mixed-style or raster clip-art icons are forbidden. Enforced by `tools/dev/check-no-emoji.sh` and `no-emoji.spec.ts` in CI.

## 2. Screens

All copy comes from `config/copy/en/*.yaml` via the gateway, not from component templates (except structural labels like "Settings", which live in Angular i18n files).

### 2.1 World Map (home, signature)

- Full-viewport Three.js canvas. Camera at a 35 to 45 degree oblique angle over the map; slow drift when idle (disabled under reduced motion).
- Regions: Springs (Vigor), Forge (Craft), Archive (Lore), Citadel Road (Resolve), Wilds (locked).
- Markers: active main quests as banners along the Citadel Road (one per application, positioned by stage), bosses at the Forge, raids at the Citadel gates, portals (Darb Kinton) as rings.
- HUD (DOM overlay, not canvas): character name, level, XP bar, stamina bar, today's quest count, "Tonight's battle log" button.
- Clicking or keyboard-selecting a region focuses the camera and opens a side panel with that region's quests and recent encounters.
- Keyboard: Tab cycles regions and markers (an off-canvas focus list mirrors every interactive 3D object); Enter opens; Esc closes; arrow keys pan.
- Fallback: if WebGL is unavailable or the user prefers reduced data, render a 2D SVG map from the same region data.

### 2.2 Character Sheet

- Left: the character's title, level, a portrait plate (an original abstract sigil, not a drawn person), stamina and status.
- Centre: four stats as engraved dials with rank, stat-XP to next rank, and "where it came from this week" (top three sources, links to battle-log entries).
- Right: equipment slots and inventory grid; each item shows its exact modifier and the event that dropped it.
- Bottom: titles and deeds (milestones).

### 2.3 Skill Tree

- A constellation over the night sky above the map: nodes are stars grouped by stat; edges are faint lines.
- Node states: locked, available (requirements met), unlocked. Requirements shown in plain words ("Master 10 spells in the Spring Security school").
- Nodes and requirements come from `config/rulebook/v1/skill-tree.yaml`.
- Rendered in Three.js (same canvas, camera tilts up) with a full DOM list alternative for keyboard and screen readers.

### 2.4 Battle Log (signature)

- Opens with the map. The camera travels encounter by encounter along a path, each encounter playing a short sequence: the real event as a caption ("Tech interview at {company}"), the game reading of it ("Raid at the Citadel gate"), effect deltas counting up, loot revealed.
- Controls: play/pause, previous/next encounter, speed (0.5x to 4x), a scrubber with encounter ticks, "skip to summary".
- Side panel: the full text log, every line linked to its source event and the rule id that produced it (honesty).
- End card: the day's totals, stamina change, spells learned, fog changes, and tomorrow's due cards and quests.
- Empty day: a single quiet pan across a dim map with "The budokai was quiet today."
- Shareable: export the replay as a short WebM via `MediaRecorder` (later phase) for the README GIF.

### 2.5 Quest Log

- Tabs: **Today** (daily quests), **Main quests** (applications by stage, like a journey), **Raids and bosses**, **Proposed** (from Darb Kaio), **History**.
- Daily quest row: title, objective progress, evidence tier badge, check-in action (asks for an optional evidence link).
- Main quest card: company, role, stage path with the current stage highlighted, raid dates, link to Darb Scouter.
- Habit editor: create, pause, archive habits (stored in DB).

### 2.6 Spellbook (Recall)

- Schools (decks) as tomes on a shelf; each shows due count, mastered count, fading count.
- Review session: one card at a time, full-focus layout. Reveal answer (Space), grade with four buttons (1 Again, 2 Hard, 3 Good, 4 Easy; mapping to SM-2 quality in config). On a first correct recall the sigil ignites ("Spell learned").
- Deck editor: Markdown cards, tags, import from CSV/Markdown.
- Stats: retention, reviews per day, upcoming load.

### 2.7 Rulebook (read-only) and Integrations

- Rulebook: the active rulebook version rendered as readable tables (stamina rates, curves, loot tables). Honesty made visible.
- Integrations: producers, their key ids, scopes, last event received, rejected events (from ingest). Create/rotate keys (shown once).

### 2.8 Auth

Login screen on the map's dim backdrop. No sign-up flow unless Nour wants multi-user.

## 3. Motion rules

- **Purpose first:** motion shows causality (an event causes an effect) or place (where in the world). No decorative bouncing.
- **Springs** for UI physics (sheets, tabs, presses, counters): presets in `tokens.ts` (e.g. `snappy`, `gentle`) defined by stiffness and damping, not by duration.
- Durations from tokens: `--dur-fast 120ms` (hover, focus), `--dur-base 220ms` (panels), `--dur-slow 480ms` (screen transitions), camera moves 1.2 to 2.5 s with ease-in-out. Easing: `cubic-bezier(0.2, 0.7, 0.1, 1)` for UI.
- Counters tick up over at most 600 ms.
- No more than 3 flashes per second anywhere (WCAG 2.3.1). No full-screen white flashes.
- Three.js runs at 60 fps on a mid laptop; render on demand when idle (no continuous loop when nothing moves); pause when the tab is hidden; DPR capped at 2; adaptive quality drops post-processing below 45 fps.
- **`prefers-reduced-motion: reduce`:** camera cuts instead of flies, no idle drift, no particles, counters show final values, battle log advances by crossfade. Also an in-app "Reduce motion" toggle that overrides the OS setting.

## 4. Accessibility requirements

- WCAG 2.2 AA. Text contrast AA (tested from tokens). Focus visible on every interactive element (2px ember ring with 2px offset).
- Full keyboard operation, including the map, skill tree and battle-log player. Every 3D interactive object has a DOM twin in a focusable list.
- Screen reader: the battle log is a live region in text form; the map has a text summary ("Forge: 1 boss engaged, 2 of 5 findings resolved").
- Colour is never the only signal (rarity, damage and status also use text and shape).
- Touch targets ≥ 44 × 44 px. Layout works from 360 px wide; the map becomes a vertical list of regions with a smaller canvas on phones.
- Playwright + `@axe-core/playwright` on every screen in CI: zero serious or critical violations.

## 5. Frontend architecture (budokai-web)

- Angular 19, standalone components, `ChangeDetectionStrategy.OnPush`, signals for local state, `input()`/`output()` APIs, control flow (`@if`, `@for`).
- State: NgRx SignalStore per feature (`CharacterStore`, `QuestStore`, `SpellbookStore`, `BattleLogStore`, `MapStore`).
- Data: GraphQL via Apollo Angular (version compatible with Angular 19, verify peer deps in Phase 0) with types generated by `@graphql-codegen/cli` from `contracts/graphql/schema.graphqls`. Live updates via `@stomp/rx-stomp`; incoming effects patch the stores.
- Three.js isolated in `features/world/engine/` (plain TypeScript classes, no Angular inside), driven by a signal-based facade and run outside Angular's zone (`NgZone.runOutsideAngular`); zone.js stays in Angular 19 (ADR-036).
- Seed mode: an `environment.demo.ts` that swaps the GraphQL link for a fixture link reading `config/seed/demo` JSON, with a visible "Demo data" banner. Used in Phase 3 before the backend exists.
- Folder layout in `CONVENTIONS.md`.
