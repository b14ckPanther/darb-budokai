/** Pure gesture decisions. Thresholds come from config/design/tokens.yaml (gesture). */
import { TOKENS } from '../design/tokens.generated';

export type Detent = 'medium' | 'large';
export type SheetOutcome = Detent | 'dismiss';

const g = TOKENS.gesture;

/** dragPx > 0 is downward; velocity in px per ms, > 0 downward. */
export function sheetRelease(e: {
  from: Detent;
  dragPx: number;
  velocity: number;
  height: number;
}): SheetOutcome {
  const dismissAt = e.height * g['sheet-dismiss-fraction'];
  if (e.velocity >= g['sheet-dismiss-velocity'] || (e.from === 'medium' && e.dragPx >= dismissAt))
    return 'dismiss';
  const step =
    e.height * (g['sheet-detents'].large - g['sheet-detents'].medium) * g['sheet-step-fraction'];
  if (e.from === 'large') {
    if (e.dragPx >= dismissAt + step) return 'dismiss';
    return e.dragPx >= step ? 'medium' : 'large';
  }
  return e.dragPx <= -step ? 'large' : 'medium';
}

export type SwipeOutcome = 'closed' | 'open' | 'commit';

/** dx < 0 is a swipe to the left (actions sit on the trailing edge). */
export function swipeRelease(dx: number, rowWidth: number): SwipeOutcome {
  if (dx >= 0) return 'closed';
  const d = -dx;
  if (d > rowWidth * g['swipe-commit-fraction']) return 'commit';
  return d >= g['swipe-reveal'] * g['swipe-open-fraction'] ? 'open' : 'closed';
}

/** 0 = large title fully shown, 1 = collapsed into the compact bar. */
export function collapseProgress(scrollY: number): number {
  return Math.min(1, Math.max(0, scrollY / g['title-collapse-offset']));
}
