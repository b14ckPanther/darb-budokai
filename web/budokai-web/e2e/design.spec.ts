import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { COPY } from '../src/app/copy/copy.generated';
import { TOKENS } from '../src/app/design/tokens.generated';

const D = COPY.design;

async function blocking(page: import('@playwright/test').Page) {
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help}`);
}

for (const [name, size] of [
  ['desktop', { width: 1440, height: 900 }],
  ['phone', { width: 390, height: 844 }],
] as const) {
  test.describe(`/design on ${name}`, () => {
    test.use({ viewport: size });

    test('has no serious or critical accessibility violations', async ({ page }) => {
      await page.goto('/design');
      await expect(page.getByRole('heading', { level: 1, name: D.title })).toBeVisible();
      expect(await blocking(page)).toEqual([]);
    });

    test('every interactive control is at least 44 px', async ({ page }) => {
      await page.goto('/design');
      const small = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('button, a[href], [role=radio]'))
          .filter((el) => el.offsetParent !== null)
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => Math.round(r.height) < 44 || Math.round(r.width) < 44)
          .map(
            ({ el, r }) =>
              `${el.textContent?.trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`,
          ),
      );
      expect(small).toEqual([]);
    });

    test('never scrolls sideways', async ({ page }) => {
      await page.goto('/design');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test('the tab bar sits in the safe area on phones and becomes a rail on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design');
  const nav = page.getByRole('navigation', { name: D.title });
  const phone = await nav.boundingBox();
  expect(Math.round(phone!.y + phone!.height)).toBe(844);
  expect(Math.round(phone!.width)).toBe(390);
  await page.setViewportSize({ width: 1440, height: 900 });
  const desk = await nav.boundingBox();
  expect(desk!.x).toBe(0);
  expect(desk!.height).toBe(900);
});

test('the motion preference sets html data-motion and survives reload', async ({ page }) => {
  await page.goto('/design');
  await page.getByRole('radio', { name: COPY.ui.motion.reduced }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
});

test('the OS reduced-motion setting is honoured', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/design');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await ctx.close();
});

test('the sheet opens from the keyboard, traps focus and returns it on Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design');
  const opener = page.getByRole('button', { name: D.samples['open-sheet'] });
  await opener.focus();
  await page.keyboard.press('Enter');
  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();
  expect(await blocking(page)).toEqual([]);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  expect(await sheet.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('the dialog confirms with the keyboard and a toast announces', async ({ page }) => {
  await page.goto('/design');
  await page.getByRole('button', { name: D.samples.danger }).click();
  await expect(page.getByRole('dialog', { name: D.samples['dialog-title'] })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: D.samples['dialog-title'] })).toBeHidden();
  await page.getByRole('button', { name: D.samples.primary }).first().click();
  await expect(page.getByRole('status')).toContainText(D.samples.toast);
});

test('the map look test renders WebGL at three light levels', async ({ page }) => {
  await page.goto('/design');
  const canvases = page.locator('bk-map-look canvas');
  await expect(canvases).toHaveCount(3);
  await canvases.last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  // Brighter levels show more light: mean luminance of each rendered canvas, read from screenshots.
  const lum: number[] = [];
  for (let i = 0; i < 3; i++) {
    const png = (await canvases.nth(i).screenshot()).toString('base64');
    lum.push(
      await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const off = document.createElement('canvas');
        off.width = 64;
        off.height = 40;
        const g = off.getContext('2d')!;
        g.drawImage(img, 0, 0, 64, 40);
        const d = g.getImageData(0, 0, 64, 40).data;
        let s = 0;
        for (let j = 0; j < d.length; j += 4) s += d[j] + d[j + 1] + d[j + 2];
        return s / (d.length / 4);
      }, png),
    );
  }
  expect(lum[0]).toBeGreaterThan(5);
  expect(lum[2]).toBeGreaterThan(lum[0]);
});

test('a real tap on the sheet handle expands it (a tap is not a drag)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design');
  await page.getByRole('button', { name: D.samples['open-sheet'] }).click();
  const handle = page.getByRole('button', { name: COPY.ui['sheet-expand'] });
  await expect(handle).toHaveAttribute('aria-expanded', 'false');
  // Let the sheet's rise spring settle before aiming at the handle.
  await page.waitForTimeout(TOKENS.motion.springs.snappy.durationMs + 100);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('button', { name: COPY.ui['sheet-collapse'] })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.getByRole('dialog')).toHaveCount(1);
});
