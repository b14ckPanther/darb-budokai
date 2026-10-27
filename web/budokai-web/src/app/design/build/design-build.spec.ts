import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import {
  buildCopyTs,
  buildIconsTs,
  buildTokensCss,
  buildTokensTs,
  resolveTokens,
} from './design-build';

const repo = join(__dirname, '../../../../../..');
const web = join(repo, 'web/budokai-web');
const brand = JSON.parse(readFileSync(join(repo, 'brand/src/tokens.json'), 'utf8'));
const design = parse(readFileSync(join(repo, 'config/design/tokens.yaml'), 'utf8'));

describe('design token pipeline', () => {
  const model = resolveTokens(brand, design);

  it('resolves brand references to the brand file, never copies', () => {
    expect(model.themes['dark']['bg']).toBe(brand.color.night.hex.toUpperCase());
    expect(model.themes['dark']['accent']).toBe(brand.color.gold.hex.toUpperCase());
    expect(model.families['display']).toContain(brand.type.display.family);
  });

  it('resolves mixes', () => {
    expect(model.themes['dark']['hairline']).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('fails loudly on an unknown brand colour', () => {
    const bad = { ...design, themes: { dark: { bg: 'brand:nope' } } };
    expect(() => resolveTokens(brand, bad)).toThrow(/nope/);
  });

  it('writes CSS custom properties for colour, type, space, motion and springs', () => {
    const css = buildTokensCss(model);
    expect(css).toContain(`--color-bg: ${model.themes['dark']['bg']};`);
    expect(css).toContain('--space-4: 1rem;');
    expect(css).toContain('--dur-base: 220ms;');
    expect(css).toMatch(/--spring-snappy: linear\(/);
    expect(css).toMatch(/--type-display-size: clamp\(/);
    expect(css).toContain('--touch-target: 2.75rem;');
  });

  it('committed generated CSS matches the config (run npm run design)', () => {
    const committed = readFileSync(join(web, 'src/styles/tokens.generated.css'), 'utf8');
    expect(committed).toBe(buildTokensCss(model));
  });

  it('committed generated TS tokens match the config (run npm run design)', () => {
    const committed = readFileSync(join(web, 'src/app/design/tokens.generated.ts'), 'utf8');
    expect(committed).toBe(buildTokensTs(model));
  });

  it('committed icon registry matches config and icon sources (run npm run design)', () => {
    const icons = parse(readFileSync(join(repo, 'config/design/icons.yaml'), 'utf8'));
    const solar = JSON.parse(
      readFileSync(join(web, 'node_modules/@iconify-json/solar/icons.json'), 'utf8'),
    );
    const sigils = Object.fromEntries(
      (icons.sigil as string[]).map((n) => [
        n,
        readFileSync(join(repo, `config/design/sigils/${n}.svg`), 'utf8'),
      ]),
    );
    const committed = readFileSync(join(web, 'src/app/design/icons.generated.ts'), 'utf8');
    expect(committed).toBe(buildIconsTs(icons, solar, sigils));
  });

  it('committed copy matches config/copy/en (run npm run design)', () => {
    const dir = join(repo, 'config/copy/en');
    const copy = Object.fromEntries(
      readdirSync(dir)
        .filter((f) => f.endsWith('.yaml'))
        .sort()
        .map((f) => [f.replace(/\.yaml$/, ''), parse(readFileSync(join(dir, f), 'utf8'))]),
    );
    expect(readFileSync(join(web, 'src/app/copy/copy.generated.ts'), 'utf8')).toBe(
      buildCopyTs(copy),
    );
  });

  it('rejects an icon that is not in the Solar set', () => {
    expect(() =>
      buildIconsTs({ ui: { x: 'solar:not-a-real-icon' }, sigil: [] }, { icons: {} }, {}),
    ).toThrow(/not-a-real-icon/);
  });
});
