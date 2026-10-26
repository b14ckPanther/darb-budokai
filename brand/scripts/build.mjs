// Builds every Darb Budokai brand asset from src/tokens.json, the seal font and src/seal.js.
//   PWEXE=/path/to/chromium-headless-shell npm run build
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import pngToIco from 'png-to-ico'
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { crackPaths } from '../src/seal.js'
import { serve } from './serve.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = `${ROOT}exports/`
const T = JSON.parse(await readFile(`${ROOT}src/tokens.json`, 'utf8'))
const C = Object.fromEntries(Object.entries(T.color).map(([k, v]) => [k, v.hex]))
const R = T.render
for (const d of ['icons', 'svg', 'social']) await mkdir(`${OUT}${d}`, { recursive: true })

const font = async (f) => opentype.parse((await readFile(`${ROOT}fonts/${f}`)).buffer)
const seal = await font(T.type.seal.file)
const display = await font(T.type.display.file)
const ui = await font(T.type.ui.file)

// ---------- the flat mark: the same glyph and the same seeded cracks as the 3D seal ----------

/** The glyph as one SVG path, scaled to `size` px wide at most and centred on (cx, cy). */
function glyphPath(cx, cy, size, fill) {
  const p = seal.getPath(T.mark.glyph, 0, 0, 1000)
  const b = p.getBoundingBox()
  const k = size / Math.max(b.x2 - b.x1, b.y2 - b.y1)
  const x = cx - ((b.x1 + b.x2) / 2) * k
  const y = cy - ((b.y1 + b.y2) / 2) * k
  return seal.getPath(T.mark.glyph, x, y, 1000 * k).toSVG(2).replace('<path ', `<path fill="${fill}" `)
}

/** Ki cracks in a 200 x 200 box, from the scene's seeded paths (scene units -> px: the glyph is 2.1 units). */
function cracksSvg(glyphPx, widths = [2.4, 0.9]) {
  const u = glyphPx / 2.1
  // main cracks only: the branches turn to noise at icon sizes
  const lines = crackPaths(R.seed, R.cracks, 3.2).filter((c) => c.main).map(({ pts, main }) => {
    const d = pts.map(([x, z], i) => `${i ? 'L' : 'M'}${(100 + x * u).toFixed(1)} ${(100 + z * u).toFixed(1)}`).join('')
    const k = main ? 1 : 0.55
    return `<path d="${d}" stroke="${C.ki}" stroke-width="${widths[0] * k}"/><path d="${d}" stroke="${C.kiHot}" stroke-width="${widths[1] * k}"/>`
  })
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${lines.join('')}</g>`
}

const goldGrad = `<linearGradient id="g" x1="40" y1="30" x2="160" y2="175" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="${C.goldLight}"/><stop offset=".42" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>`
const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>${defs}<clipPath id="r"><rect width="200" height="200" rx="44"/></clipPath></defs>${body}</svg>\n`
const night = `<rect id="bg" width="200" height="200" rx="44" fill="${C.night}"/>`

/** The full mark: night tile, ki cracks, gold glyph. Used by the wordmark and mark-on-night. */
const MARK_GLYPH = 124
/** A night outline under the glyph keeps it clear of the cracks, like the shadow the 3D seal casts. */
const halo = (fill) => glyphPath(100, 100, MARK_GLYPH, fill).replace('<path ', `<path stroke="${C.night}" stroke-width="9" stroke-linejoin="round" `)
const markOnNight = svg(`${night}<g clip-path="url(#r)">${cracksSvg(MARK_GLYPH)}</g>${halo('url(#g)')}${glyphPath(100, 100, MARK_GLYPH, 'url(#g)')}`, goldGrad)
const svgs = {
  'mark-on-night.svg': markOnNight,
  'mark-gold.svg': svg(glyphPath(100, 100, 150, 'url(#g)'), goldGrad),
  'mark-ivory.svg': svg(glyphPath(100, 100, 150, C.ivory)),
  'mark-ink.svg': svg(glyphPath(100, 100, 150, C.ink)),
  // small sizes: no cracks, a bigger glyph, flat gold, so 武 survives 16 px
  'favicon.svg': svg(`${night}${glyphPath(100, 102, 158, C.gold)}`),
  'badge-mono.svg': svg(glyphPath(100, 100, 168, '#fff')),
}
for (const [f, s] of Object.entries(svgs)) await writeFile(`${OUT}svg/${f}`, s)

// ---------- wordmark (text outlined: no font needed to display it) ----------

function lockup(ink, sub, accent) {
  const NAME = 196, DARB = 50, JP = 40, GAP = 26
  const nameB = display.getPath(T.shortName, 0, 0, NAME).getBoundingBox()
  const darbB = ui.getPath('Darb', 0, 0, DARB).getBoundingBox()
  const jpB = seal.getPath(T.japanese, 0, 0, JP).getBoundingBox()
  const base = -(nameB.y1 - GAP + darbB.y1)
  const H = base + Math.max(nameB.y2, 0)
  const x0 = H + 60
  const jpX = x0 + (nameB.x2 - nameB.x1) + 36 - jpB.x1
  const W = jpX + jpB.x2 + 4
  const out = (f, text, x, y, size, fill) => f.getPath(text, x, y, size).toSVG(2).replace('<path ', `<path fill="${fill}" `)
  const mark = markOnNight.replace(/<\/?svg[^>]*>/g, '').replace('id="g"', 'id="wg"').replaceAll('url(#g)', 'url(#wg)').replace('id="r"', 'id="wr"').replaceAll('url(#r)', 'url(#wr)')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 ${Math.ceil(W)} ${Math.ceil(H + 16)}">
  <g transform="scale(${H / 200})">${mark}</g>
  ${out(ui, 'Darb', x0 + 6 - darbB.x1, base + nameB.y1 - GAP, DARB, sub)}
  ${out(display, T.shortName, x0 - nameB.x1, base, NAME, ink)}
  ${out(seal, T.japanese, jpX, base, JP, accent)}
</svg>
`
}
await writeFile(`${OUT}svg/wordmark-on-dark.svg`, lockup(C.ivory, C.muted, C.gold))
await writeFile(`${OUT}svg/wordmark-on-light.svg`, lockup(C.ink, '#6f6357', C.goldDeep))

// ---------- 3D renders ----------

const srv = await serve()
const base = `http://127.0.0.1:${srv.address().port}/render.html`
const browser = await chromium.launch({
  executablePath: process.env.PWEXE,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.error('render error:', e.message))

async function render(name, { w, h, scale = 0.6, variant = 'tile' }) {
  await page.setViewportSize({ width: w, height: h })
  await page.goto(`${base}?variant=${variant}&w=${w}&h=${h}&scale=${scale}`)
  await page.waitForFunction('window.__ready === true', null, { timeout: 300000 })
  const file = `${OUT}${name}`
  await page.locator('#stage').screenshot({ path: file })
  return file
}

const S = R.markScale
const master = await render('icons/_master-tile.png', { w: 2048, h: 2048, scale: S.tile })
const masterMask = await render('icons/_master-maskable.png', { w: 2048, h: 2048, scale: S.maskable })
const masterApple = await render('icons/_master-apple.png', { w: 2048, h: 2048, scale: S.apple })
const masterMac = await render('icons/_master-mac.png', { w: 2048, h: 2048, scale: S.mac })
await render('social/og-image.png', { w: T.icons.og[0], h: T.icons.og[1], variant: 'og' })
await render('social/hero.png', { w: 2400, h: 1260, variant: 'og' })
await browser.close()
srv.close()

// ---------- icon set ----------

/** iOS-style superellipse ("squircle"), n = 5. */
function squircle(size, fill = '#fff') {
  const r = size / 2, pts = []
  for (let i = 0; i < 360; i++) {
    const t = (i / 360) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t)
    pts.push(`${(r + Math.sign(c) * Math.abs(c) ** 0.4 * r).toFixed(2)},${(r + Math.sign(s) * Math.abs(s) ** 0.4 * r).toFixed(2)}`)
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><polygon points="${pts.join(' ')}" fill="${fill}"/></svg>`)
}
const tile = (src, size) => sharp(src).resize(size, size, { kernel: 'lanczos3' }).composite([{ input: squircle(size), blend: 'dest-in' }]).png()

for (const s of T.icons.tile) await tile(master, s).toFile(`${OUT}icons/icon-${s}.png`)
for (const s of T.icons.maskable) await sharp(masterMask).resize(s, s, { kernel: 'lanczos3' }).png().toFile(`${OUT}icons/icon-maskable-${s}.png`)
await sharp(masterApple).resize(T.icons.apple, T.icons.apple, { kernel: 'lanczos3' }).flatten({ background: C.night }).png().toFile(`${OUT}icons/apple-touch-icon.png`)

// macOS / desktop: 824 px squircle on a 1024 canvas with the system drop shadow
{
  const size = T.icons.mac, body = Math.round(size * 0.805), off = Math.round((size - body) / 2)
  const art = await tile(masterMac, body).toBuffer()
  const shadow = await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: squircle(body, 'rgba(0,0,0,0.55)'), left: off, top: off + Math.round(size * 0.012) }])
    .blur(size * 0.012).png().toBuffer()
  await sharp(shadow).composite([{ input: art, left: off, top: off }]).png().toFile(`${OUT}icons/icon-desktop-${size}.png`)
}

for (const s of T.icons.favicon) await sharp(Buffer.from(svgs['favicon.svg'])).resize(s, s).png().toFile(`${OUT}icons/favicon-${s}.png`)
await writeFile(`${OUT}icons/favicon.ico`, await pngToIco(T.icons.favicon.map((s) => `${OUT}icons/favicon-${s}.png`)))
await sharp(Buffer.from(svgs['badge-mono.svg'])).resize(T.icons.badge, T.icons.badge).png().toFile(`${OUT}icons/badge-${T.icons.badge}.png`)
await writeFile(`${OUT}icons/favicon.svg`, svgs['favicon.svg'])

// ---------- manifest, tokens, head tags ----------

const manifest = {
  name: T.name,
  short_name: T.shortName,
  description: T.tagline,
  display: 'standalone',
  background_color: C.night,
  theme_color: C.night,
  icons: [
    ...T.icons.tile.map((s) => ({ src: `/icons/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'any' })),
    ...T.icons.maskable.map((s) => ({ src: `/icons/icon-maskable-${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'maskable' })),
    { src: `/icons/badge-${T.icons.badge}.png`, sizes: `${T.icons.badge}x${T.icons.badge}`, type: 'image/png', purpose: 'monochrome' },
  ],
}
await writeFile(`${OUT}manifest.webmanifest`, JSON.stringify(manifest, null, 2) + '\n')

await writeFile(`${OUT}tokens.css`, `/* Generated from src/tokens.json by scripts/build.mjs. Edit the JSON, not this file. */
:root {
${Object.entries(T.color).map(([k, v]) => `  --${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${v.hex}; /* ${v.role} */`).join('\n')}
  --font-seal: '${T.type.seal.family}', 'Hiragino Mincho ProN', serif;
  --font-display: '${T.type.display.family}', 'Hiragino Mincho ProN', serif;
  --font-ui: '${T.type.ui.family}', system-ui, sans-serif;
}
`)

await writeFile(`${OUT}head.html`, `<link rel="icon" href="/icons/favicon.ico" sizes="48x48">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="${C.night}">
<meta property="og:title" content="${T.name}">
<meta property="og:description" content="${T.tagline}">
<meta property="og:image" content="/social/og-image.png">
<meta name="twitter:card" content="summary_large_image">
`)
console.log('built', OUT)
