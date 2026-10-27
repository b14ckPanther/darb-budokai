import { buildHeights, heightAt } from './terrain';

const spec = {
  seed: 7,
  octaves: 5,
  height: 3.2,
  size: 24,
  frequency: 3,
  persistence: 0.5,
  terrace: 1.6,
};

describe('procedural terrain', () => {
  it('is deterministic for a seed and differs across seeds', () => {
    expect(heightAt(1.5, -2, spec)).toBe(heightAt(1.5, -2, spec));
    expect(heightAt(1.5, -2, spec)).not.toBe(heightAt(1.5, -2, { ...spec, seed: 8 }));
  });

  it('stays within the configured height', () => {
    const h = buildHeights({ ...spec, segments: 40 });
    expect(h).toHaveLength(41 * 41);
    expect(Math.max(...h)).toBeLessThanOrEqual(spec.height);
    expect(Math.min(...h)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...h) - Math.min(...h)).toBeGreaterThan(spec.height * 0.3);
  });
});
