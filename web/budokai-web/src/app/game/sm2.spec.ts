import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { addDays, previewGrades, review, spellState } from './sm2';

const fx = JSON.parse(
  readFileSync(join(__dirname, '../../../../../contracts/fixtures/sm2/v1.json'), 'utf8'),
);
const params = { ...fx.params, grades: { again: 1, hard: 3, good: 4, easy: 5 } };

describe('SM-2 (shared fixtures)', () => {
  it.each(fx.cases.map((c: { name: string }) => [c.name, c]))('%s', (_n, c) => {
    const after = review({ ...c.before, due: fx.today }, c.quality, params, fx.today);
    expect(after.reps).toBe(c.after.reps);
    expect(after.interval).toBe(c.after.interval);
    expect(after.ef).toBeCloseTo(c.after.ef, 6);
    expect(after.due).toBe(c.after.due);
  });

  it('intervals never shrink on consecutive passes', () => {
    let s = { reps: 0, interval: 0, ef: 2.5, due: fx.today };
    let last = 0;
    for (const q of [3, 4, 5, 3, 4, 3, 5]) {
      s = review(s, q, params, s.due);
      expect(s.interval).toBeGreaterThanOrEqual(last);
      last = s.interval;
    }
  });

  it('previews the next interval for each grade button', () => {
    const p = previewGrades({ reps: 2, interval: 6, ef: 2.6, due: fx.today }, params, fx.today);
    expect(p.map((g) => g.grade)).toEqual(['again', 'hard', 'good', 'easy']);
    expect(p.find((g) => g.grade === 'again')!.interval).toBe(1);
    expect(p.find((g) => g.grade === 'good')!.interval).toBe(16);
  });

  it('adds days across a month end', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
  });
});

describe('spell state', () => {
  const rules = { masteryIntervalDays: 21, fadeAfterDays: 7 };
  const today = '2026-10-26';
  it('maps SM-2 state to spells', () => {
    expect(spellState({ reps: 0, interval: 0, ef: 2.5, due: today }, rules, today)).toBe(
      'unlearned',
    );
    expect(spellState({ reps: 2, interval: 6, ef: 2.5, due: '2026-10-28' }, rules, today)).toBe(
      'learned',
    );
    expect(spellState({ reps: 5, interval: 22, ef: 2.6, due: '2026-11-10' }, rules, today)).toBe(
      'mastered',
    );
    expect(spellState({ reps: 3, interval: 9, ef: 2.2, due: '2026-10-18' }, rules, today)).toBe(
      'fading',
    );
    expect(spellState({ reps: 3, interval: 9, ef: 2.2, due: '2026-10-19' }, rules, today)).toBe(
      'learned',
    );
  });
});
