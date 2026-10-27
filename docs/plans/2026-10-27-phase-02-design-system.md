# Phase 2 plan: design system

Source: `docs/PLAN.md` Phase 2 and the Phase 1 spec (`docs/specs/2026-10-27-phase-01-budokai-spec.md`, section 5). The spec already settles the direction (Seal Stone, ADR-032), the icon set (Solar Bold Duotone, ADR-033), type, palette and the single dark theme (ADR-036), so no separate Phase 2 spec was written; the table below is the plan as executed. Decided under Nour's delegation (2026-10-27).

| # | Task (PLAN order) | Test written first | Commit |
|---|---|---|---|
| 1 | Direction boards: three brand-faithful variants side by side; pick recorded | (Phase 1 swatch page, `docs/specs/assets/directions.html`); ADR-038 | Phase 1, this phase's ledger |
| 2 | Tokens: `config/design/tokens.yaml` references `brand/src/tokens.json` by name; generator writes CSS, Sass and typed TS; springs integrated into CSS `linear()` | `colour.spec.ts`, `spring.spec.ts`, `design-build.spec.ts` (drift guards), `contrast.spec.ts` (30 pairs) | `b7cf353` |
| 3 | Fonts self-hosted (Yuji Boku cut to six glyphs), licences in `ASSETS.md` | e2e smoke `uses the brand fonts` | `e5a872d`, `67a7316` |
| 4 | Icon pipeline: Solar Bold Duotone from Iconify JSON at build time plus original sigils | `icons.spec.ts`, `no-emoji.spec.ts` | `b7cf353`, `9b09b82` |
| 5 | Motion tokens, spring presets, reduced-motion service (`html[data-motion]`) | `motion.service.spec.ts`, e2e motion tests | `e5a872d` |
| 6 | Base components: button, segmented, tab bar and rail, sheet, large title, swipe row, meter, stat dial, evidence and rarity badges, dialog, toast, icon | `ui.spec.ts`, `native.spec.ts`, `gestures.spec.ts` | `d81c3f7` |
| 7 | Map look test: terrain, contour shader, ember and fog at three light levels; render on demand | `render-scheduler.spec.ts` (fake clock), `terrain.spec.ts`, `map-look.component.spec.ts`, e2e WebGL light levels | `b9c441b` |
| 8 | `/design` style page (dev and demo only), Playwright and axe | `e2e/design.spec.ts` (axe phone and desktop, 44 px, overflow, rail and tab bar, sheet focus, dialog, toast) | `67a7316` |
| 9 | Approval checkpoint: screenshots on desktop and 390 px phone, map look test | `docs/screenshots/phase-02/` reviewed; recorded in `PROGRESS.md` | ledger commit |
