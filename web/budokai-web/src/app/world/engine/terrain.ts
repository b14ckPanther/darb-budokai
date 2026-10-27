/** Seeded value-noise heightfield for the arena stone. Parameters come from tokens (map). */
export interface TerrainSpec {
  seed: number;
  octaves: number;
  height: number;
  size: number;
  frequency: number;
  persistence: number;
  terrace: number;
}

function hash(ix: number, iz: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fz = smooth(z - iz);
  const a = hash(ix, iz, seed);
  const b = hash(ix + 1, iz, seed);
  const c = hash(ix, iz + 1, seed);
  const d = hash(ix + 1, iz + 1, seed);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}

/** Height in world units at (x, z), in [0, spec.height]. */
export function heightAt(x: number, z: number, spec: TerrainSpec): number {
  const scale = spec.frequency / spec.size;
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < spec.octaves; o++) {
    sum += amp * valueNoise(x * scale * freq, z * scale * freq, spec.seed + o * 101);
    norm += amp;
    amp *= spec.persistence;
    freq *= 2;
  }
  // Terrace slightly so the stone reads as carved tiers, not soft hills.
  const n = sum / norm;
  const shaped = Math.pow(n, spec.terrace);
  return Math.min(spec.height, Math.max(0, shaped * spec.height));
}

/** Row-major heights for a (segments + 1)^2 grid centred on the origin. */
export function buildHeights(spec: TerrainSpec & { segments: number }): number[] {
  const out: number[] = [];
  const n = spec.segments;
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const x = (i / n - 0.5) * spec.size;
      const z = (j / n - 0.5) * spec.size;
      out.push(heightAt(x, z, spec));
    }
  }
  return out;
}
