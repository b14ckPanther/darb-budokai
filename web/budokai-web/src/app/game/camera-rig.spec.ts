import { approach, focusPose, orbitPosition } from './camera-rig';

describe('camera rig math', () => {
  it('places the camera on an orbit around its target', () => {
    const p = orbitPosition({ target: [0, 0, 0], azimuthDeg: 0, elevationDeg: 0, distance: 10 });
    expect(p[0]).toBeCloseTo(0);
    expect(p[1]).toBeCloseTo(0);
    expect(p[2]).toBeCloseTo(10);
    const top = orbitPosition({ target: [1, 2, 3], azimuthDeg: 0, elevationDeg: 90, distance: 5 });
    expect(top[1]).toBeCloseTo(7);
  });

  it('focuses a region: target on its centre, closer by the zoom factor', () => {
    const base = {
      target: [0, 0, 0] as [number, number, number],
      azimuthDeg: 28,
      elevationDeg: 46,
      distance: 20,
    };
    const f = focusPose(base, [9, 8], 0.5);
    expect(f.target).toEqual([9, 0, 8]);
    expect(f.distance).toBe(10);
    expect(f.azimuthDeg).toBe(28);
  });

  it('approaches the goal without overshoot, faster with more time, and snaps when told', () => {
    expect(approach(0, 10, 0, 6)).toBe(0);
    const a = approach(0, 10, 100, 6);
    const b = approach(0, 10, 300, 6);
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(b).toBeLessThan(10);
    expect(approach(0, 10, 100, Infinity)).toBe(10);
  });
});
