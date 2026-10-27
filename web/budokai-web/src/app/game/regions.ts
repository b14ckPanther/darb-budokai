export interface Region {
  id: string;
  stat?: string | null;
  centre: readonly [number, number] | readonly number[];
  radius: number;
  tint?: string;
  locked?: boolean;
}

export interface Marker {
  id: string;
  kind: string;
  region: string;
  at: readonly [number, number] | readonly number[];
  ref: string;
}

/** The region whose circle contains (x, z), nearest centre first relative to its radius. */
export function regionAt<R extends Region>(x: number, z: number, regions: readonly R[]): R | null {
  let best: R | null = null;
  let bestD = Infinity;
  for (const r of regions) {
    const d = Math.hypot(x - r.centre[0], z - r.centre[1]) / r.radius;
    if (d <= 1 && d < bestD) {
      best = r;
      bestD = d;
    }
  }
  return best;
}

/** Config errors that would break the map: unknown tints, unknown regions, duplicate ids. */
export function validateMap(
  map: { regions: readonly Region[]; markers: readonly Marker[] },
  tints: readonly string[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const r of map.regions) {
    if (ids.has(r.id)) errors.push(`region ${r.id}: duplicate id`);
    ids.add(r.id);
    if (!r.tint || !tints.includes(r.tint)) errors.push(`region ${r.id}: unknown tint ${r.tint}`);
  }
  for (const m of map.markers)
    if (!ids.has(m.region)) errors.push(`marker ${m.id}: unknown region ${m.region}`);
  return errors;
}
