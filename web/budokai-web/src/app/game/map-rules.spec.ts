import { regionFog, regionLight } from './map-rules';

const rules = {
  lightWindowDays: 3,
  lightDecay: 0.5,
  lightFullAt: 4,
  fogPerMissedDay: 0.3,
  fogLiftPerActiveDay: 0.1,
  fogMax: 1,
};
const day = (date: string, a: number, missed = false) => ({
  date,
  activity: { forge: a },
  missed: missed ? ['forge'] : [],
});

describe('map light and fog from the timeline', () => {
  it('light decays with age inside the window and saturates at 1', () => {
    const days = [
      day('2026-10-20', 9),
      day('2026-10-24', 2),
      day('2026-10-25', 2),
      day('2026-10-26', 2),
    ];
    // 2 + 2*0.5 + 2*0.25 = 3.5, over 4 => 0.875; the 10-20 day is outside the window.
    expect(regionLight(days, 'forge', rules, '2026-10-26')).toBeCloseTo(0.875);
    expect(regionLight([day('2026-10-26', 40)], 'forge', rules, '2026-10-26')).toBe(1);
    expect(regionLight([], 'forge', rules, '2026-10-26')).toBe(0);
  });

  it('fog builds on missed days, lifts on active days and stays within 0..max', () => {
    const days = [
      day('2026-10-22', 0, true),
      day('2026-10-23', 0, true),
      day('2026-10-24', 3),
      day('2026-10-25', 0, true),
    ];
    expect(regionFog(days, 'forge', rules)).toBeCloseTo(0.3 + 0.3 - 0.1 + 0.3);
    expect(regionFog([day('2026-10-24', 3), day('2026-10-25', 3)], 'forge', rules)).toBe(0);
    const many = Array.from({ length: 10 }, (_, i) => day(`2026-10-${10 + i}`, 0, true));
    expect(regionFog(many, 'forge', rules)).toBe(1);
  });
});
