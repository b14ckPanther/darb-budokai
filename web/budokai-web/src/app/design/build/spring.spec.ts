import { springCurve, toCssLinear } from './spring';

describe('spring curves', () => {
  it('starts at 0 and settles at 1', () => {
    const c = springCurve({ stiffness: 520, damping: 40 }, 40);
    expect(c.points[0]).toBe(0);
    expect(c.points[c.points.length - 1]).toBe(1);
    expect(c.points).toHaveLength(40);
  });

  it('overshoots when under-damped and not when well damped', () => {
    const bouncy = springCurve({ stiffness: 340, damping: 20 }, 40);
    const snappy = springCurve({ stiffness: 520, damping: 46 }, 40);
    expect(Math.max(...bouncy.points)).toBeGreaterThan(1.02);
    expect(Math.max(...snappy.points)).toBeLessThanOrEqual(1.0001);
  });

  it('stiffer springs settle sooner', () => {
    const stiff = springCurve({ stiffness: 600, damping: 40 }, 40);
    const soft = springCurve({ stiffness: 150, damping: 24 }, 40);
    expect(stiff.durationMs).toBeLessThan(soft.durationMs);
    expect(stiff.durationMs).toBeGreaterThan(0);
  });

  it('prints a CSS linear() easing', () => {
    const css = toCssLinear(springCurve({ stiffness: 520, damping: 40 }, 8));
    expect(css).toMatch(/^linear\(0, [0-9., ]+, 1\)$/);
  });
});
