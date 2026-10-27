/** Terrain and ember shaders shared by the world map and the Phase 2 look test. */
export const TERRAIN_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vDepth;
  void main() {
    vPos = position;
    vNormal = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export function terrainFrag(maxRegions: number): string {
  return /* glsl */ `
  #define MAX_REGIONS ${maxRegions}
  uniform vec3 uStone, uStoneLit, uContour, uKi, uKiHot, uFog, uKey, uDust;
  uniform float uInterval, uWidth, uLight, uFogDensity, uEmber, uTime, uHeight, uTile, uFalloff, uFloor;
  uniform float uTintStrength, uFogStrength;
  uniform int uCount;
  uniform vec2 uCentre[MAX_REGIONS];
  uniform float uRadius[MAX_REGIONS];
  uniform float uRLight[MAX_REGIONS];
  uniform float uRFog[MAX_REGIONS];
  uniform vec3 uTint[MAX_REGIONS];
  uniform vec2 uPulsePos;
  uniform float uPulse;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vDepth;

  void main() {
    float light = uLight;
    float dust = 0.0;
    float glow = 0.0;
    vec3 tint = vec3(0.0);
    float cover = 0.0;
    if (uCount > 0) {
      float wsum = 0.0;
      float l = 0.0;
      for (int i = 0; i < MAX_REGIONS; i++) {
        if (i >= uCount) break;
        float d = distance(vPos.xz, uCentre[i]);
        float w = 1.0 - smoothstep(uRadius[i] * 0.45, uRadius[i], d);
        wsum += w;
        l += w * uRLight[i];
        dust += w * uRFog[i];
        tint += w * uTint[i];
        glow += uRLight[i] * uEmber * exp(-d * d * uFalloff);
      }
      cover = clamp(wsum, 0.0, 1.0);
      float outside = 1.0 - cover;
      light = (l + outside * uLight) / (wsum + outside);
      dust = dust / max(wsum, 1e-3) * cover;
      tint = tint / max(wsum, 1e-3);
    } else {
      glow = uEmber * exp(-distance(vPos.xz, uPulsePos) * distance(vPos.xz, uPulsePos) * uFalloff);
    }
    float pr = distance(vPos.xz, uPulsePos);
    glow += uPulse * exp(-pr * pr * uFalloff * 1.6);
    float flicker = 0.88 + 0.12 * sin(uTime * 0.003 + vPos.x * 1.7 + vPos.z);
    glow *= flicker;

    float f = vPos.y / uInterval;
    float dl = abs(fract(f - 0.5) - 0.5) / max(fwidth(f), 1e-4);
    float line = 1.0 - min(dl / uWidth, 1.0);
    vec2 t = vPos.xz / uTile;
    vec2 g = abs(fract(t - 0.5) - 0.5) / max(fwidth(t), vec2(1e-4));
    float tile = 1.0 - min(min(g.x, g.y), 1.0);

    float diff = max(dot(normalize(vNormal), normalize(uKey)), 0.0);
    float lift = vPos.y / uHeight;
    vec3 base = mix(uStone, uStoneLit, clamp(0.15 + diff * 0.75 + lift * 0.3, 0.0, 1.0));
    base = mix(base, base * 0.55 + tint * 0.6, uTintStrength * cover);
    base *= uFloor + (1.0 - uFloor) * light;
    vec3 col = base + uKi * glow * 0.55;
    vec3 ink = uContour * (0.35 + 0.65 * light) + uKiHot * glow * 0.45;
    col = mix(col, ink, line * (0.5 + 0.5 * light) * (1.0 - dust * 0.6));
    col = mix(col, uContour * 0.55, tile * 0.1 * (0.4 + light));
    col = mix(col, uDust, clamp(dust * uFogStrength, 0.0, 1.0));
    float fogF = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    gl_FragColor = vec4(mix(col, uFog, clamp(fogF, 0.0, 1.0)), 1.0);
  }
`;
}

export const EMBER_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime, uRise, uHeight, uEmber, uPx;
  varying float vLife;
  void main() {
    float life = fract(aSeed + uTime * uRise);
    vLife = life;
    vec3 p = position;
    p.y += life * uHeight;
    p.x += sin(uTime * 0.0015 + aSeed * 40.0) * 0.25 * life;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uPx * (1.0 - life) * uEmber * 6.0 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const EMBER_FRAG = /* glsl */ `
  uniform vec3 uKiHot;
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * (1.0 - vLife);
    gl_FragColor = vec4(uKiHot * a, a);
  }
`;
