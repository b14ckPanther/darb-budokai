import { collapseProgress, releaseVelocity, sheetRelease, swipeRelease } from './gestures';
import { TOKENS } from '../design/tokens.generated';

const g = TOKENS.gesture;

describe('sheet release', () => {
  const height = 800;

  it('dismisses past the distance threshold', () => {
    expect(
      sheetRelease({
        from: 'medium',
        dragPx: height * g['sheet-dismiss-fraction'] + 1,
        velocity: 0,
        height,
      }),
    ).toBe('dismiss');
  });

  it('dismisses on a fast downward flick even when short', () => {
    expect(
      sheetRelease({
        from: 'large',
        dragPx: 30,
        velocity: g['sheet-dismiss-velocity'] + 0.1,
        height,
      }),
    ).toBe('dismiss');
  });

  it('snaps up to large on an upward drag from medium', () => {
    expect(sheetRelease({ from: 'medium', dragPx: -120, velocity: -0.2, height })).toBe('large');
  });

  it('steps down from large to medium on a moderate downward drag', () => {
    expect(sheetRelease({ from: 'large', dragPx: 140, velocity: 0.2, height })).toBe('medium');
  });

  it('stays put on a small drag', () => {
    expect(sheetRelease({ from: 'medium', dragPx: 10, velocity: 0, height })).toBe('medium');
  });
});

describe('swipe release', () => {
  it('opens the actions past the reveal width', () => {
    expect(swipeRelease(-(g['swipe-reveal'] * 0.6), 360)).toBe('open');
  });

  it('commits the first action on a long swipe', () => {
    expect(swipeRelease(-(360 * g['swipe-commit-fraction'] + 1), 360)).toBe('commit');
  });

  it('closes on a short swipe or a swipe the other way', () => {
    expect(swipeRelease(-10, 360)).toBe('closed');
    expect(swipeRelease(80, 360)).toBe('closed');
  });
});

describe('large title collapse', () => {
  it('is 0 at the top and 1 past the collapse offset', () => {
    expect(collapseProgress(0)).toBe(0);
    expect(collapseProgress(g['title-collapse-offset'] / 2)).toBeCloseTo(0.5);
    expect(collapseProgress(g['title-collapse-offset'] * 3)).toBe(1);
    expect(collapseProgress(-20)).toBe(0);
  });
});

describe('release velocity', () => {
  it('averages over the configured window, not the last move', () => {
    const samples = [
      { t: 0, y: 0 },
      { t: 40, y: 8 },
      { t: 58, y: 12 },
      { t: 60, y: 15 },
    ];
    expect(releaseVelocity(samples)).toBeCloseTo(15 / 60, 3);
    expect(releaseVelocity([{ t: 0, y: 0 }])).toBe(0);
  });
});
