/** Damped spring (mass 1) from rest at 0 to 1, sampled for CSS linear() and JS gestures. */
export interface SpringSpec {
  stiffness: number;
  damping: number;
}

export interface SpringCurve {
  durationMs: number;
  points: number[];
}

const STEP_MS = 1;
const SETTLE = 0.001;

export function springCurve(spec: SpringSpec, samples: number): SpringCurve {
  const dt = STEP_MS / 1000;
  let x = 0;
  let v = 0;
  const trace: number[] = [0];
  let settledFor = 0;
  // Integrate (semi-implicit Euler) until the spring has stayed settled for a little while.
  while (trace.length < 20000) {
    const a = -spec.stiffness * (x - 1) - spec.damping * v;
    v += a * dt;
    x += v * dt;
    trace.push(x);
    settledFor = Math.abs(x - 1) < SETTLE && Math.abs(v) < SETTLE * 10 ? settledFor + 1 : 0;
    if (settledFor > 16) break;
  }
  const durationMs = (trace.length - 1) * STEP_MS;
  const points: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = Math.round((i / (samples - 1)) * (trace.length - 1));
    points.push(Math.round(trace[t] * 10000) / 10000);
  }
  points[0] = 0;
  points[points.length - 1] = 1;
  return { durationMs, points };
}

export function toCssLinear(curve: SpringCurve): string {
  return `linear(${curve.points.join(', ')})`;
}

/** Position of the spring at time t (ms), for JS-driven gestures. */
export function springAt(curve: SpringCurve, tMs: number): number {
  if (tMs <= 0) return 0;
  if (tMs >= curve.durationMs) return 1;
  const f = (tMs / curve.durationMs) * (curve.points.length - 1);
  const i = Math.floor(f);
  const r = f - i;
  return curve.points[i] * (1 - r) + curve.points[i + 1] * r;
}
