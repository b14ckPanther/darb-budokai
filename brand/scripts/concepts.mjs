// Renders each brand direction to concepts/<d>.png and a side-by-side comparison sheet.
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { serve } from './serve.mjs'

const DIRS = (process.env.DIRS || 'arena,stars,seal,ascension').split(',')
const NAMES = { arena: 'A  The Ring', stars: 'B  Seven Stars', seal: 'C  The Seal', ascension: 'D  Power Up' }
const OUT = new URL('../concepts/', import.meta.url).pathname
const srv = await serve(); const port = srv.address().port
const b = await chromium.launch({ executablePath: process.env.PWEXE, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 1024, height: 1024 } })
p.on('pageerror', (e) => console.log('ERR', e.message))
p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
const squircle = (size) => { const pts = []; for (let i = 0; i < 360; i++) { const t = i / 180 * Math.PI, c = Math.cos(t), s = Math.sin(t); pts.push(`${(size/2 + Math.sign(c) * Math.abs(c) ** 0.4 * size/2).toFixed(1)},${(size/2 + Math.sign(s) * Math.abs(s) ** 0.4 * size/2).toFixed(1)}`) } return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><polygon points="${pts.join(' ')}" fill="#fff"/></svg>`) }
for (const d of DIRS) {
  await p.goto(`http://127.0.0.1:${port}/concepts/render.html?d=${d}&size=1024`)
  await p.waitForFunction('window.__ready === true', null, { timeout: 180000 })
  await p.locator('canvas').screenshot({ path: `${OUT}${d}-full.png` })
  await sharp(`${OUT}${d}-full.png`).resize(512, 512).composite([{ input: squircle(512), blend: 'dest-in' }]).png().toFile(`${OUT}icon-${d}.png`)
}
await b.close(); srv.close()
const comps = []
const all = ['arena', 'stars', 'seal', 'ascension']
for (const [i, d] of all.entries()) {
  try {
    comps.push({ input: await sharp(`${OUT}${d}-full.png`).resize(420).toBuffer(), left: 30 + i * 450, top: 30 })
    comps.push({ input: await sharp(`${OUT}icon-${d}.png`).resize(120).toBuffer(), left: 140 + i * 450, top: 480 })
    comps.push({ input: await sharp(`${OUT}icon-${d}.png`).resize(48).toBuffer(), left: 290 + i * 450, top: 516 })
    comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="44"><text x="210" y="30" font-family="Georgia" font-size="26" fill="#FBF7EC" text-anchor="middle">${NAMES[d]}</text></svg>`), left: 30 + i * 450, top: 620 })
  } catch {}
}
await sharp({ create: { width: 1830, height: 690, channels: 4, background: '#0a1410' } }).composite(comps).png().toFile(`${OUT}compare.png`)
console.log('ok')
