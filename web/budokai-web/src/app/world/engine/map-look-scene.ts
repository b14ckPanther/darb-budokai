/**
 * Phase 2 map look test: one patch of procedural arena stone with engraved contour lines, a tile
 * grid, ki ember light and fog. Plain TypeScript, no Angular. Colours are the exact token values:
 * the shader works in display sRGB and output conversion is off, so WebGL matches the CSS.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { TOKENS } from '../../design/tokens.generated';
import { RenderScheduler } from './render-scheduler';
import { buildHeights } from './terrain';

export type LightLevel = keyof typeof TOKENS.map.levels;

const M = TOKENS.map;
const C = TOKENS.themes.dark;

function rgb(hex: string): Vector3 {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const VERT = /* glsl */ `
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

const FRAG = /* glsl */ `
  uniform vec3 uStone, uStoneLit, uContour, uKi, uKiHot, uFog, uKey, uEmberPos;
  uniform float uInterval, uWidth, uLight, uFogDensity, uEmber, uTime, uHeight, uTile, uFalloff, uFloor;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vDepth;
  void main() {
    float f = vPos.y / uInterval;
    float d = abs(fract(f - 0.5) - 0.5) / max(fwidth(f), 1e-4);
    float line = 1.0 - min(d / uWidth, 1.0);
    vec2 t = vPos.xz / uTile;
    vec2 g = abs(fract(t - 0.5) - 0.5) / max(fwidth(t), vec2(1e-4));
    float tile = 1.0 - min(min(g.x, g.y), 1.0);
    float diff = max(dot(normalize(vNormal), normalize(uKey)), 0.0);
    float lift = vPos.y / uHeight;
    vec3 base = mix(uStone, uStoneLit, clamp(0.15 + diff * 0.75 + lift * 0.3, 0.0, 1.0));
    base *= uFloor + (1.0 - uFloor) * uLight;
    float r = distance(vPos.xz, uEmberPos.xz);
    float flicker = 0.88 + 0.12 * sin(uTime * 0.003 + r * 1.7);
    float glow = uEmber * exp(-r * r * uFalloff) * flicker;
    vec3 col = base + uKi * glow * 0.55;
    vec3 ink = uContour * (0.35 + 0.65 * uLight) + uKiHot * glow * 0.45;
    col = mix(col, ink, line * (0.5 + 0.5 * uLight));
    col = mix(col, uContour * 0.55, tile * 0.1 * (0.4 + uLight));
    float fogF = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    gl_FragColor = vec4(mix(col, uFog, clamp(fogF, 0.0, 1.0)), 1.0);
  }
`;

const EMBER_VERT = /* glsl */ `
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

const EMBER_FRAG = /* glsl */ `
  uniform vec3 uKiHot;
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * (1.0 - vLife);
    gl_FragColor = vec4(uKiHot * a, a);
  }
`;

export class MapLookScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly terrain: ShaderMaterial;
  private readonly embers: ShaderMaterial;
  private readonly scheduler: RenderScheduler;
  private readonly geometries: BufferGeometry[] = [];
  private level: LightLevel = 'active';
  private animate = true;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    const bg = rgb(C.bg);
    this.renderer.setClearColor(new Color().setRGB(bg.x, bg.y, bg.z, LinearSRGBColorSpace));

    const cam = M.camera;
    this.camera = new PerspectiveCamera(cam.fov, 1, 0.1, 200);
    const el = (cam['elevation-deg'] * Math.PI) / 180;
    const az = (cam['azimuth-deg'] * Math.PI) / 180;
    this.camera.position.set(
      Math.sin(az) * Math.cos(el) * cam.distance,
      Math.sin(el) * cam.distance,
      Math.cos(az) * Math.cos(el) * cam.distance,
    );
    this.camera.lookAt(0, M.height * 0.25, 0);

    const geo = new PlaneGeometry(M.size, M.size, M.segments, M.segments);
    geo.rotateX(-Math.PI / 2);
    const heights = buildHeights({ ...M, segments: M.segments });
    const pos = geo.attributes['position'] as BufferAttribute;
    // PlaneGeometry rows run from +z to -z after rotation; heights are row-major from -z.
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const col = Math.round((x / M.size + 0.5) * M.segments);
      const row = Math.round((z / M.size + 0.5) * M.segments);
      pos.setY(i, heights[row * (M.segments + 1) + col]);
    }
    geo.computeVertexNormals();
    this.geometries.push(geo);

    this.terrain = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uStone: { value: rgb(C['map-stone']) },
        uStoneLit: { value: rgb(C['map-stone-lit']) },
        uContour: { value: rgb(C.accent) },
        uKi: { value: rgb(C.ki) },
        uKiHot: { value: rgb(C['ki-hot']) },
        uFog: { value: rgb(C['map-dust']) },
        uKey: { value: new Vector3(...M['key-light']) },
        uEmberPos: { value: new Vector3(M.ember.x, M.ember.height, M.ember.z) },
        uInterval: { value: M['contour-interval'] },
        uWidth: { value: M['contour-width'] },
        uLight: { value: 0 },
        uFogDensity: { value: 0 },
        uEmber: { value: 0 },
        uTime: { value: 0 },
        uHeight: { value: M.height },
        uTile: { value: M['tile-size'] },
        uFalloff: { value: M['glow-falloff'] },
        uFloor: { value: M['light-floor'] },
      },
    });
    this.scene.add(new Mesh(geo, this.terrain));

    const e = M.embers;
    const ePos = new Float32Array(e.count * 3);
    const eSeed = new Float32Array(e.count);
    for (let i = 0; i < e.count; i++) {
      // Golden-angle spiral: even, deterministic scatter around the ember.
      const a = i * 2.39996;
      const r = Math.sqrt((i + 0.5) / e.count) * e.radius;
      ePos[i * 3] = M.ember.x + Math.cos(a) * r;
      ePos[i * 3 + 1] = M.ember.height * 0.6;
      ePos[i * 3 + 2] = M.ember.z + Math.sin(a) * r;
      eSeed[i] = (i * 0.618034) % 1;
    }
    const eGeo = new BufferGeometry();
    eGeo.setAttribute('position', new BufferAttribute(ePos, 3));
    eGeo.setAttribute('aSeed', new BufferAttribute(eSeed, 1));
    this.geometries.push(eGeo);
    this.embers = new ShaderMaterial({
      vertexShader: EMBER_VERT,
      fragmentShader: EMBER_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uRise: { value: e.rise },
        uHeight: { value: e.height },
        uEmber: { value: 0 },
        uPx: { value: 1 },
        uKiHot: { value: rgb(C['ki-hot']) },
      },
    });
    this.scene.add(new Points(eGeo, this.embers));

    this.scheduler = new RenderScheduler(
      (cb) => requestAnimationFrame(cb),
      (h) => cancelAnimationFrame(h),
      (t) => this.draw(t),
    );
    this.setLevel(this.level);
  }

  setLevel(level: LightLevel): void {
    this.level = level;
    const l = M.levels[level];
    this.terrain.uniforms['uLight'].value = l.light;
    this.terrain.uniforms['uFogDensity'].value = l.fog;
    this.terrain.uniforms['uEmber'].value = l.ember;
    this.embers.uniforms['uEmber'].value = l.ember;
    this.scheduler.requestRender();
  }

  /** Under reduced motion the embers freeze and nothing animates. */
  setAnimate(on: boolean): void {
    this.animate = on;
    this.scheduler.requestRender();
  }

  resize(width: number, height: number, dpr: number): void {
    if (!width || !height) return;
    const ratio = Math.min(dpr, M['dpr-cap']);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.embers.uniforms['uPx'].value = height * ratio * M.embers.size;
    this.scheduler.requestRender();
  }

  dispose(): void {
    this.scheduler.dispose();
    this.geometries.forEach((g) => g.dispose());
    this.terrain.dispose();
    this.embers.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private draw(t: number): boolean {
    const time = this.animate ? t : 0;
    this.terrain.uniforms['uTime'].value = time;
    this.embers.uniforms['uTime'].value = time;
    this.renderer.render(this.scene, this.camera);
    return this.animate && M.levels[this.level].ember > 0;
  }
}
