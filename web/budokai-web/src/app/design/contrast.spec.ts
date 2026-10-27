import { contrastRatio } from './build/colour';
import { TOKENS } from './tokens.generated';

/** WCAG AA over every declared text, mark and control pair (PLAN Phase 2 task 2). */
describe('token contrast', () => {
  const theme = TOKENS.themes.dark as Record<string, string>;

  it.each(TOKENS.contrast.map((p) => [p.fg, p.bg, p.min]))('%s on %s meets %d:1', (fg, bg, min) => {
    expect(theme[fg as string]).toBeDefined();
    expect(theme[bg as string]).toBeDefined();
    expect(contrastRatio(theme[fg as string], theme[bg as string])).toBeGreaterThanOrEqual(
      min as number,
    );
  });

  it('declares every text role on the page background', () => {
    const textRoles = Object.keys(theme).filter((r) => r.startsWith('text') || r === 'danger');
    const onBg = TOKENS.contrast
      .filter((p) => p.bg === 'bg' || p.bg === 'accent')
      .map((p) => p.fg as string);
    expect(textRoles.filter((r) => !onBg.includes(r))).toEqual([]);
  });

  it('never pairs ki orange with a text role (brand rule: ki is energy only)', () => {
    expect(TOKENS.contrast.filter((p) => p.fg === 'ki' && p.min >= 4.5)).toEqual([]);
  });
});
