# Darb Budokai brand

Budokai is a Darb product. It wears Darb's colours (night, forest, gold, ivory) plus the tournament's ki orange, and has its own mark: **武 (bu, "martial"), the first character of Budokai, struck in gold into tournament stone that cracks open with ki.** Your real life is the tournament; every good day is a round won.

Chosen by Nour from four directions (the ring, seven stars, the seal, power up). The other three are kept in `concepts/`.

## See it

```sh
cd brand && npm install
node scripts/serve.mjs          # http://127.0.0.1:4180/ : brand sheet with every asset
# open /render.html?variant=tile or ?variant=og&w=1200&h=630 to see the live 3D scene
```

## Rebuild every asset

```sh
PWEXE=/path/to/chromium-headless-shell npm run build
```

Nothing is drawn by hand and nothing is hardcoded in the build:

| File | Holds |
|---|---|
| `src/tokens.json` | colours and roles, type, render settings (seed, light, bloom, framing), icon sizes, copy |
| `src/seal.js` | the glyph outlines and the seeded ki cracks, shared by the 3D scene and the flat SVGs, so they always match |
| `src/scene.js` | Three.js scene: the glyph extruded in two-tone gold, dark tiled stone, flat ki fissures, bloom |
| `render.html` | renders one variant of the scene (`tile` for icons, `og` for social cards with the copy) |
| `scripts/build.mjs` | renders the masters, cuts every icon, writes the SVG marks, wordmarks, manifest and CSS tokens |

## What's in `exports/`

| Path | Use |
|---|---|
| `icons/icon-192.png`, `icon-512.png` | PWA icons, purpose `any` (squircle cut) |
| `icons/icon-maskable-192.png`, `-512.png` | PWA maskable (seal inside the 80% safe zone) |
| `icons/apple-touch-icon.png` | iOS home screen, 180 px, opaque |
| `icons/icon-desktop-1024.png` | Desktop: macOS grid, 824 px body with system shadow |
| `icons/favicon.ico`, `favicon.svg`, `favicon-16/32/48.png` | Browser tab: no cracks, bigger glyph, so 武 reads at 16 px |
| `icons/badge-96.png` | Notification badge and Android monochrome icon |
| `svg/mark-on-night.svg` | The full flat mark: night tile, ki cracks, gold glyph |
| `svg/mark-gold.svg`, `mark-ivory.svg`, `mark-ink.svg` | The glyph alone, for use on any background |
| `svg/wordmark-on-dark.svg`, `-on-light.svg` | Lockup: mark, Darb, Budokai, 天下一武道会 (text outlined, no font needed) |
| `social/og-image.png` | 1200 x 630 sharing card |
| `social/hero.png` | 2400 x 1260 README and store hero |
| `manifest.webmanifest`, `head.html` | Drop-in PWA manifest and `<head>` tags |
| `tokens.css` | CSS custom properties generated from `tokens.json` |

## Rules

- The mark is only ever 武 in Yuji Boku, gold on night or stone. Don't redraw, outline or recolour it outside the listed variants.
- Darb's doorway outline belongs to Darb itself; Budokai never uses it.
- Ki orange is energy only (cracks, glows, the sunset). Never use it for text.
- Every visual is original and made in code. Inspired by Dragon Ball's tournament; no official art, logos, characters or audio.
- Fonts: Yuji Boku (seal), Zen Antique (display) and Geist (interface), all under the SIL Open Font License (`fonts/`).
