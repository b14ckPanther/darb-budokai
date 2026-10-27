import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import messages from '../src/locale/messages.en.json';

test.describe('home page smoke', () => {
  test('opens on the world map with the product name in the title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/map$/);
    await expect(page).toHaveTitle(new RegExp(`\\| ${messages['app.name']}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('has no serious or critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('uses the brand fonts, never a system default', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(body.split(',')[0].replace(/["']/g, '').trim()).toBe('Geist');
    const loaded = await page.evaluate(() => document.fonts.check('16px Geist'));
    expect(loaded).toBe(true);
  });

  test('fits a 360 px phone without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
