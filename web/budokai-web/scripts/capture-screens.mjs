// Captures review screenshots for a phase. Needs a running dev server.
// Usage: node scripts/capture-screens.mjs <shots.json> [baseURL]
// shots.json: [{ "name", "path", "viewport": "phone" | "desktop", "full"?, "scrollTo"?, "click"?, "wait"? }]
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const [, , specPath, base = 'http://localhost:4200'] = process.argv;
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const outDir = resolve(dirname(specPath));
mkdirSync(outDir, { recursive: true });
const viewports = {
  phone: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
};

const browser = await chromium.launch(
  process.env.PWEXE ? { executablePath: process.env.PWEXE } : {},
);
for (const shot of spec.shots) {
  const ctx = await browser.newContext({
    ...viewports[shot.viewport],
    reducedMotion: shot.reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  await page.goto(base + shot.path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (shot.scrollTo) {
    await page.evaluate((s) => {
      const el = document.querySelector(s);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64);
    }, shot.scrollTo);
  }
  for (const c of shot.click ?? []) await page.getByRole(c.role, { name: c.name }).first().click();
  await page.waitForTimeout(shot.wait ?? 1200);
  await page.screenshot({ path: join(outDir, `${shot.name}.png`), fullPage: !!shot.full });
  console.log('captured', shot.name);
  await ctx.close();
}
await browser.close();
