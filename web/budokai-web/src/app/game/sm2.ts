/**
 * SM-2 (Wozniak, 1987) for the client preview. Parameters come from the rulebook; the same shared
 * fixtures (contracts/fixtures/sm2/v1.json) will test spellbook-service in Phase 8.
 */
export interface Sm2State {
  reps: number;
  interval: number;
  ef: number;
  due: string;
}

export interface Sm2Params {
  minEasiness: number;
  firstIntervalDays: number;
  secondIntervalDays: number;
  passGrade: number;
  grades: { again: number; hard: number; good: number; easy: number };
}

export type GradeName = keyof Sm2Params['grades'];
export type SpellState = 'unlearned' | 'learned' | 'mastered' | 'fading';

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** One review with quality q (0..5). The interval uses the easiness from before the review. */
export function review(s: Sm2State, q: number, p: Sm2Params, today: string): Sm2State {
  const passed = q >= p.passGrade;
  const reps = passed ? s.reps + 1 : 0;
  const interval = !passed
    ? p.firstIntervalDays
    : s.reps === 0
      ? p.firstIntervalDays
      : s.reps === 1
        ? p.secondIntervalDays
        : Math.round(s.interval * s.ef);
  const ef = Math.max(p.minEasiness, s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return { reps, interval, ef: Math.round(ef * 1e6) / 1e6, due: addDays(today, interval) };
}

export function previewGrades(s: Sm2State, p: Sm2Params, today: string) {
  return (Object.keys(p.grades) as GradeName[]).map((grade) => {
    const next = review(s, p.grades[grade], p, today);
    return { grade, quality: p.grades[grade], interval: next.interval, next };
  });
}

export function spellState(
  s: Sm2State,
  rules: { masteryIntervalDays: number; fadeAfterDays: number },
  today: string,
): SpellState {
  if (s.reps === 0) return 'unlearned';
  if (daysBetween(s.due, today) > rules.fadeAfterDays) return 'fading';
  return s.interval >= rules.masteryIntervalDays ? 'mastered' : 'learned';
}
