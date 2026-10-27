import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { COPY } from '../src/app/copy/copy.generated';
import { DEMO_SEED } from '../src/app/demo/seed.generated';

const ROUTES = [
  '/map',
  '/quests',
  '/spellbook',
  '/spellbook/kafka',
  '/character',
  '/character/skills',
  '/log',
  '/rulebook',
  '/integrations',
];

async function blocking(page: Page) {
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help}`);
}

for (const [name, viewport] of [
  ['phone', { width: 390, height: 844 }],
  ['desktop', { width: 1440, height: 900 }],
] as const) {
  test.describe(`every screen on ${name}`, () => {
    test.use({ viewport });
    for (const path of ROUTES) {
      test(`${path}: axe clean, no sideways scroll, demo banner shown`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole('note')).toContainText(COPY.shell['demo-banner']);
        await page.waitForTimeout(400);
        expect(await blocking(page)).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}

test('the tab bar sits at the bottom on a phone, reaches every screen, and marks the current one', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/map');
  const nav = page.getByRole('navigation', { name: COPY.shell['nav-label'] });
  const box = (await nav.boundingBox())!;
  expect(Math.round(box.y + box.height)).toBe(844);
  for (const [path, label] of [
    ['/quests', COPY.nav.quests],
    ['/spellbook', COPY.nav.spellbook],
    ['/character', COPY.nav.character],
    ['/log', COPY.nav.log],
  ]) {
    await nav.getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(path));
    await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
  }
});

test('safe-area insets pad the tab bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/map');
  const pad = await page.evaluate(() => {
    const nav = document.querySelector('bk-nav nav')!;
    return getComputedStyle(nav).paddingBottom;
  });
  // No inset in a desktop browser, so the rule resolves to 0px without breaking layout.
  expect(pad).toMatch(/px$/);
  const css = await page.evaluate(() =>
    Array.from(document.styleSheets)
      .flatMap((s) => {
        try {
          return Array.from(s.cssRules).map((r) => r.cssText);
        } catch {
          return [];
        }
      })
      .join(' '),
  );
  expect(css).toContain('safe-area-inset-bottom');
});

test('keyboard walk: Tab reaches a map marker in the place list and opens its sheet', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/map');
  const marker = page.getByRole('button', { name: /Cobalt Reach, Home task/ });
  for (let i = 0; i < 40 && !(await marker.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(marker).toBeFocused();
  await page.keyboard.press('Enter');
  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText('Cobalt Reach');
  await page.keyboard.press('Escape');
  await expect(marker).toBeFocused();
});

test('clicking a region on the 3D map opens it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/map');
  await page.waitForTimeout(1500);
  const label = page.locator('[data-label="forge"]');
  const box = (await label.boundingBox())!;
  // Just below the label is the region's ground.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height + 30);
  await expect(page.getByRole('dialog')).toContainText(/Forge|cache refactor/);
});

test.describe('without WebGL', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      // @ts-expect-error test shim
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        return /webgl/.test(type) ? null : orig.call(this, type, ...rest);
      };
    });
  });

  test('the map falls back to a flat SVG map with the same places', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('bk-flat-map svg')).toBeVisible();
    await expect(page.locator('bk-world-canvas')).toHaveCount(0);
    await expect(page.getByText(COPY.map.fallback)).toBeVisible();
    await expect(page.locator('bk-flat-map circle.region')).toHaveCount(
      DEMO_SEED.map.regions.length,
    );
  });
});

test('battle log: plays, pauses, moves and seeks from the keyboard', async ({ page }) => {
  await page.goto('/log');
  const day = DEMO_SEED.replays.days[0];
  const caption = page.locator('.caption');
  await expect(caption).toContainText(day.encounters[0].reading);
  await page.keyboard.press('ArrowRight');
  await expect(caption).toContainText(day.encounters[1].reading);
  await page.keyboard.press('ArrowLeft');
  await expect(caption).toContainText(day.encounters[0].reading);
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: COPY.battlelog.pause })).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: COPY.battlelog.play })).toBeVisible();
  const scrub = page.getByRole('slider', { name: COPY.battlelog.scrubber });
  await scrub.focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('heading', { name: COPY.battlelog['end-title'] })).toBeVisible();
});

test('battle log plays through on its own at 4x', async ({ page }) => {
  await page.goto('/log');
  await page.getByRole('radio', { name: '4x' }).click();
  await page.getByRole('button', { name: COPY.battlelog.play }).click();
  const day = DEMO_SEED.replays.days[0];
  await expect(page.locator('.caption')).toContainText(day.encounters[1].reading, {
    timeout: 5000,
  });
});

test('battle log under reduced motion uses a plain crossfade', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/log');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => page.locator('.caption').evaluate((el) => getComputedStyle(el).animationName))
    .toMatch(/caption-fade$/);
  await ctx.close();
});

test('a quiet day says so', async ({ page }) => {
  await page.goto('/log?date=2026-10-12');
  await expect(page.getByText(COPY.battlelog.quiet)).toBeVisible();
});

test('spellbook review works from the keyboard only', async ({ page }) => {
  await page.goto('/spellbook/kafka');
  await expect(page.getByRole('button', { name: COPY.spellbook.reveal })).toBeVisible();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('button', { name: new RegExp(`^${COPY.spellbook.grades.good}`) }),
  ).toBeVisible();
  await page.keyboard.press('3');
  await expect(page.getByText(/Card 2 of/)).toBeVisible();
});

test('quest log: check in through the row button and see the toast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/quests');
  const row = page.locator('bk-swipe-row', { hasText: 'Walk outside' });
  await row.getByRole('button', { name: COPY.quests['check-in'] }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Walk outside');
});

test('quest log: swipe a row left to reveal its actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/quests');
  const content = page.locator('bk-swipe-row', { hasText: 'Walk outside' }).locator('.content');
  const b = (await content.boundingBox())!;
  await page.mouse.move(b.x + b.width - 20, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width - 140, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('bk-swipe-row', { hasText: 'Walk outside' })).toHaveClass(/open/);
});
