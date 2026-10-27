# Assets and licences

Every third-party asset in Darb Budokai, with its licence. Everything not listed here is original and
made in this repo. CLAUDE.md 1.4: no official game or anime IP of any kind.

## Fonts (SIL Open Font License 1.1)

| Font | Use | Source in repo | Shipped to the browser | Licence file |
|---|---|---|---|---|
| Zen Antique | Display headings (large sizes only) | `brand/fonts/ZenAntique-Regular.ttf` | `web/budokai-web/public/fonts/ZenAntique-Regular.latin.woff2` (Latin subset) | `web/budokai-web/public/fonts/OFL-ZenAntique.txt` |
| Geist | Interface text and numbers | `brand/fonts/Geist.ttf` | `web/budokai-web/public/fonts/Geist.latin.woff2` (Latin subset, variable weight) | `web/budokai-web/public/fonts/OFL-Geist.txt` |
| Yuji Boku | The 武 seal and the Japanese name only | `brand/fonts/YujiBoku-Regular.ttf` | `web/budokai-web/public/fonts/YujiBoku-Regular.seal.woff2` (six glyphs: 武天下一道会) | `web/budokai-web/public/fonts/OFL-YujiBoku.txt` |

Subsets are made with fontTools `pyftsubset` (`--flavor=woff2`). Fonts are self-hosted; nothing is loaded from a font CDN.

## Icons

| Set | Use | Licence | Delivery |
|---|---|---|---|
| Solar, Bold Duotone style, by 480 Design | Interface controls only | CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) | `@iconify-json/solar` (dev dependency); the icons named in `config/design/icons.yaml` are copied at build time into `web/budokai-web/src/app/design/icons.generated.ts`. No runtime CDN. |

Attribution: "Solar Icons by 480 Design, licensed under CC BY 4.0." The generated registry carries the same line.

## Original assets (this repo)

| Asset | Where | Notes |
|---|---|---|
| Brand mark, wordmarks, app icons, social cards | `brand/` | Made in code (Three.js and SVG). The Darb Budokai name, the 武 seal mark and the brand renders are not licensed for reuse as another product's brand. |
| Game sigils (stats, evidence tiers, rarity) | `config/design/sigils/*.svg` | Drawn for this project on a 24 point grid in the Solar duotone style. |
| Map look test terrain, contours, ember light | `web/budokai-web/src/app/world/engine/` | Procedural, seeded from `config/design/tokens.yaml`. |

## Code libraries

Runtime libraries (Angular, Angular CDK, RxJS, Three.js) are MIT licensed and listed in `web/budokai-web/package.json`.
