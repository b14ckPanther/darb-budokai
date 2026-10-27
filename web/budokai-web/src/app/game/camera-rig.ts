/** Camera rig maths for the world map. Pure: no Three.js, so it is unit tested directly. */
export type Vec3 = [number, number, number];

export interface Orbit {
  target: Vec3;
  azimuthDeg: number;
  elevationDeg: number;
  distance: number;
}

const RAD = Math.PI / 180;

export function orbitPosition(o: Orbit): Vec3 {
  const az = o.azimuthDeg * RAD;
  const el = o.elevationDeg * RAD;
  return [
    o.target[0] + Math.sin(az) * Math.cos(el) * o.distance,
    o.target[1] + Math.sin(el) * o.distance,
    o.target[2] + Math.cos(az) * Math.cos(el) * o.distance,
  ];
}

/** Look at a region from the same angle, closer by `zoom`. */
export function focusPose(base: Orbit, centre: readonly number[], zoom: number): Orbit {
  return { ...base, target: [centre[0], 0, centre[1]], distance: base.distance * zoom };
}

/** Exponential approach: no overshoot, frame-rate independent. stiffness Infinity snaps. */
export function approach(current: number, goal: number, dtMs: number, stiffness: number): number {
  if (!isFinite(stiffness)) return goal;
  return goal + (current - goal) * Math.exp((-stiffness * dtMs) / 1000);
}

export function approachOrbit(cur: Orbit, goal: Orbit, dtMs: number, stiffness: number): Orbit {
  const a = (x: number, y: number) => approach(x, y, dtMs, stiffness);
  return {
    target: [
      a(cur.target[0], goal.target[0]),
      a(cur.target[1], goal.target[1]),
      a(cur.target[2], goal.target[2]),
    ],
    azimuthDeg: a(cur.azimuthDeg, goal.azimuthDeg),
    elevationDeg: a(cur.elevationDeg, goal.elevationDeg),
    distance: a(cur.distance, goal.distance),
  };
}

export function orbitSettled(a: Orbit, b: Orbit, eps: number): boolean {
  const d = [
    a.target[0] - b.target[0],
    a.target[1] - b.target[1],
    a.target[2] - b.target[2],
    a.azimuthDeg - b.azimuthDeg,
    a.elevationDeg - b.elevationDeg,
    a.distance - b.distance,
  ];
  return d.every((x) => Math.abs(x) < eps);
}
