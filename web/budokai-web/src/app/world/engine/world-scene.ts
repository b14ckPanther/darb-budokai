/**
 * The world map scene: procedural arena stone, per-region light, tint and dust, ember light,
 * markers and a camera rig. Plain TypeScript, no Angular. Colours are exact token values: the
 * shaders work in display sRGB and output conversion is off, so WebGL matches the CSS.
 * Renders on demand: a frame only when something changed or while something animates.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { TOKENS } from '../../design/tokens.generated';
import {
  Orbit,
  approachOrbit,
  focusPose,
  orbitPosition,
  orbitSettled,
} from '../../game/camera-rig';
import { regionAt } from '../../game/regions';
import { RenderScheduler } from './render-scheduler';
import { EMBER_FRAG, EMBER_VERT, TERRAIN_VERT, terrainFrag } from './shaders';
import { buildHeights, heightAt } from './terrain';

const M = TOKENS.map;
const W = TOKENS.world;
const C = TOKENS.themes.dark as Record<string, string>;

export interface SceneRegion {
  id: string;
  centre: readonly number[];
  radius: number;
  tint: string;
  light: number;
  fog: number;
}

export interface SceneMarker {
  id: string;
  kind: string;
  at: readonly number[];
}

/** Screen position (CSS px) of each region centre; visible false when behind the camera. */
export interface LabelPosition {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface Pick {
  marker: string | null;
  region: string | null;
}

function rgb(hex: string): Vector3 {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function colour(hex: string): Color {
  const v = rgb(hex);
  return new Color().setRGB(v.x, v.y, v.z, LinearSRGBColorSpace);
}

export class WorldScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly terrain: ShaderMaterial;
  private readonly ground: Mesh;
  private readonly embers: ShaderMaterial;
  private readonly emberPoints: Points;
  private readonly markerGroup = new Group();
  private readonly markerMaterials = {
    normal: new MeshBasicMaterial({ color: colour(C['accent']) }),
    selected: new MeshBasicMaterial({ color: colour(C['ki-hot']) }),
    portal: new MeshBasicMaterial({ color: colour(C['stone']), side: DoubleSide }),
  };
  private readonly scheduler: RenderScheduler;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly raycaster = new Raycaster();
  private readonly base: Orbit;
  private overview: Orbit;
  private framed = false;
  private orbit: Orbit;
  private goal: Orbit;
  private regions: SceneRegion[] = [];
  private animate = true;
  private drift = false;
  private lastT = 0;
  private selected: string | null = null;
  /** Called after each frame with projected region label positions. */
  onLabels: ((labels: LabelPosition[]) => void) | null = null;
  private readonly tmp = new Vector3();

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.renderer.setClearColor(colour(C['bg']));

    const cam = M.camera;
    this.camera = new PerspectiveCamera(cam.fov, 1, 0.1, 200);
    this.base = {
      target: [0, M.height * 0.25, 0],
      azimuthDeg: cam['azimuth-deg'],
      elevationDeg: cam['elevation-deg'],
      distance: cam.distance,
    };
    this.overview = { ...this.base };
    this.orbit = { ...this.base };
    this.goal = { ...this.base };

    const geo = new PlaneGeometry(M.size, M.size, M.segments, M.segments);
    geo.rotateX(-Math.PI / 2);
    const heights = buildHeights({ ...M, segments: M.segments });
    const pos = geo.attributes['position'] as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const col = Math.round((pos.getX(i) / M.size + 0.5) * M.segments);
      const row = Math.round((pos.getZ(i) / M.size + 0.5) * M.segments);
      pos.setY(i, heights[row * (M.segments + 1) + col]);
    }
    geo.computeVertexNormals();
    this.disposables.push(geo);

    const max = W['max-regions'];
    this.terrain = new ShaderMaterial({
      vertexShader: TERRAIN_VERT,
      fragmentShader: terrainFrag(max),
      uniforms: {
        uStone: { value: rgb(C['map-stone']) },
        uStoneLit: { value: rgb(C['map-stone-lit']) },
        uContour: { value: rgb(C['accent']) },
        uKi: { value: rgb(C['ki']) },
        uKiHot: { value: rgb(C['ki-hot']) },
        uFog: { value: rgb(C['map-dust']) },
        uDust: { value: rgb(C['map-dust']) },
        uKey: { value: new Vector3(...M['key-light']) },
        uInterval: { value: M['contour-interval'] },
        uWidth: { value: M['contour-width'] },
        uLight: { value: M.levels.quiet.light },
        uFogDensity: { value: M.levels.active.fog },
        uEmber: { value: 0 },
        uTime: { value: 0 },
        uHeight: { value: M.height },
        uTile: { value: M['tile-size'] },
        uFalloff: { value: M['glow-falloff'] },
        uFloor: { value: M['light-floor'] },
        uTintStrength: { value: W['region-tint-strength'] },
        uFogStrength: { value: W['fog-strength'] },
        uRingWidth: { value: W['ring-width'] },
        uRingStrength: { value: W['ring-strength'] },
        uCount: { value: 0 },
        uCentre: { value: Array.from({ length: max }, () => new Vector2()) },
        uRadius: { value: new Array(max).fill(1) },
        uRLight: { value: new Array(max).fill(0) },
        uRFog: { value: new Array(max).fill(0) },
        uTint: { value: Array.from({ length: max }, () => new Vector3()) },
        uPulsePos: { value: new Vector2(M.ember.x, M.ember.z) },
        uPulse: { value: 0 },
      },
    });
    this.ground = new Mesh(geo, this.terrain);
    this.scene.add(this.ground);

    const e = M.embers;
    const ePos = new Float32Array(e.count * 3);
    const eSeed = new Float32Array(e.count);
    for (let i = 0; i < e.count; i++) {
      // Golden-angle spiral: an even, deterministic scatter around the ember.
      const a = i * 2.39996;
      const r = Math.sqrt((i + 0.5) / e.count) * e.radius;
      ePos[i * 3] = Math.cos(a) * r;
      ePos[i * 3 + 1] = 0;
      ePos[i * 3 + 2] = Math.sin(a) * r;
      eSeed[i] = (i * 0.618034) % 1;
    }
    const eGeo = new BufferGeometry();
    eGeo.setAttribute('position', new BufferAttribute(ePos, 3));
    eGeo.setAttribute('aSeed', new BufferAttribute(eSeed, 1));
    this.disposables.push(eGeo);
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
    this.emberPoints = new Points(eGeo, this.embers);
    this.scene.add(this.emberPoints, this.markerGroup);
    this.placeEmbers(M.ember.x, M.ember.z);
    this.disposables.push(this.terrain, this.embers, ...Object.values(this.markerMaterials));

    this.scheduler = new RenderScheduler(
      (cb) => requestAnimationFrame(cb),
      (h) => cancelAnimationFrame(h),
      (t) => this.draw(t),
    );
  }

  /** Look-test mode: one global light level, no regions. */
  setGlobal(l: { light: number; fog: number; ember: number }): void {
    const u = this.terrain.uniforms;
    u['uCount'].value = 0;
    u['uLight'].value = l.light;
    u['uFogDensity'].value = l.fog;
    u['uEmber'].value = l.ember;
    this.embers.uniforms['uEmber'].value = l.ember;
    this.scheduler.requestRender();
  }

  setRegions(regions: SceneRegion[]): void {
    this.regions = regions.slice(0, W['max-regions']);
    // With regions this is the world map, not the look test: frame the whole arena.
    if (this.regions.length && !this.framed) {
      this.framed = true;
      const o = W.overview;
      const off = W['target-offset'];
      this.overview = {
        target: [off[0], this.base.target[1], off[1]],
        distance: o.distance,
        elevationDeg: o['elevation-deg'],
        azimuthDeg: o['azimuth-deg'],
      };
      this.terrain.uniforms['uFogDensity'].value = W['depth-fog'];
      this.goal = { ...this.overview };
      this.orbit = { ...this.overview };
    }
    const u = this.terrain.uniforms;
    u['uCount'].value = this.regions.length;
    this.regions.forEach((r, i) => {
      (u['uCentre'].value as Vector2[])[i].set(r.centre[0], r.centre[1]);
      (u['uRadius'].value as number[])[i] = r.radius;
      (u['uRLight'].value as number[])[i] = r.light;
      (u['uRFog'].value as number[])[i] = r.fog;
      (u['uTint'].value as Vector3[])[i].copy(rgb(r.tint));
    });
    u['uEmber'].value = M.levels.active.ember;
    // Embers rise over the brightest region.
    const hot = [...this.regions].sort((a, b) => b.light - a.light)[0];
    if (hot) {
      this.placeEmbers(hot.centre[0], hot.centre[1]);
      this.embers.uniforms['uEmber'].value = hot.light * M.levels.active.ember;
    }
    this.scheduler.requestRender();
  }

  setMarkers(markers: SceneMarker[], selected: string | null): void {
    this.selected = selected;
    for (const child of [...this.markerGroup.children]) {
      this.markerGroup.remove(child);
      (child as Mesh).geometry?.dispose();
    }
    const s = W['marker-size'];
    for (const m of markers) {
      const mat =
        m.id === selected
          ? this.markerMaterials.selected
          : m.kind === 'portal'
            ? this.markerMaterials.portal
            : this.markerMaterials.normal;
      const geometry =
        m.kind === 'boss'
          ? new OctahedronGeometry(s * 0.9)
          : m.kind === 'portal'
            ? new TorusGeometry(s, s * 0.14, 8, 32)
            : m.kind === 'raid'
              ? new CylinderGeometry(s * 0.7, s * 0.9, s * 1.6, 6)
              : new ConeGeometry(s * 0.55, s * 1.8, 4);
      const mesh = new Mesh(geometry, mat);
      mesh.position.set(m.at[0], heightAt(m.at[0], m.at[1], M) + W['marker-height'], m.at[1]);
      mesh.userData['marker'] = m.id;
      this.markerGroup.add(mesh);
    }
    this.scheduler.requestRender();
  }

  /** Move the camera to a point on the map (null returns to the overview). */
  focus(centre: readonly number[] | null, snap = false): void {
    this.goal = centre ? focusPose(this.overview, centre, W['focus-zoom']) : { ...this.overview };
    if (snap || !this.animate) this.orbit = { ...this.goal };
    this.scheduler.requestRender();
  }

  /** A burst of ember light at one point (battle-log encounters). */
  pulse(centre: readonly number[] | null, strength: number): void {
    const u = this.terrain.uniforms;
    if (centre) {
      (u['uPulsePos'].value as Vector2).set(centre[0], centre[1]);
      this.placeEmbers(centre[0], centre[1]);
    }
    u['uPulse'].value = centre ? strength : 0;
    this.embers.uniforms['uEmber'].value = centre ? strength : this.embers.uniforms['uEmber'].value;
    this.scheduler.requestRender();
  }

  setIdleDrift(on: boolean): void {
    this.drift = on;
    this.scheduler.requestRender();
  }

  /** Under reduced motion the camera cuts instead of travelling, and embers freeze. */
  setAnimate(on: boolean): void {
    this.animate = on;
    if (!on) this.orbit = { ...this.goal };
    this.scheduler.requestRender();
  }

  setVisible(visible: boolean): void {
    this.scheduler.setPaused(!visible);
  }

  pick(clientX: number, clientY: number): Pick {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.intersectObjects(this.markerGroup.children as Object3D[], false)[0];
    if (hit) return { marker: hit.object.userData['marker'] as string, region: null };
    const ground = this.raycaster.intersectObject(this.ground, false)[0];
    const region = ground ? regionAt(ground.point.x, ground.point.z, this.regions) : null;
    return { marker: null, region: region?.id ?? null };
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
    for (const child of this.markerGroup.children) (child as Mesh).geometry?.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private emitLabels(): void {
    if (!this.onLabels) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.onLabels(
      this.regions.map((r) => {
        this.tmp
          .set(r.centre[0], heightAt(r.centre[0], r.centre[1], M) + 0.5, r.centre[1])
          .project(this.camera);
        return {
          id: r.id,
          x: ((this.tmp.x + 1) / 2) * w,
          y: ((1 - this.tmp.y) / 2) * h,
          visible: this.tmp.z < 1 && Math.abs(this.tmp.x) < 1.1 && Math.abs(this.tmp.y) < 1.1,
        };
      }),
    );
  }

  private placeEmbers(x: number, z: number): void {
    this.emberPoints.position.set(x, heightAt(x, z, M) + 0.2, z);
  }

  private draw(t: number): boolean {
    const dt = this.lastT ? Math.min(t - this.lastT, 100) : 16;
    this.lastT = t;
    if (this.animate && this.drift && this.selected === null) {
      this.goal = {
        ...this.goal,
        azimuthDeg: this.goal.azimuthDeg + (W['idle-drift-deg-per-s'] * dt) / 1000,
      };
    }
    this.orbit = this.animate
      ? approachOrbit(this.orbit, this.goal, dt, W['camera-stiffness'])
      : { ...this.goal };
    const p = orbitPosition(this.orbit);
    this.camera.position.set(p[0], p[1], p[2]);
    this.camera.lookAt(this.orbit.target[0], this.orbit.target[1], this.orbit.target[2]);
    const time = this.animate ? t : 0;
    this.terrain.uniforms['uTime'].value = time;
    this.embers.uniforms['uTime'].value = time;
    this.renderer.render(this.scene, this.camera);
    this.emitLabels();
    const moving = !orbitSettled(this.orbit, this.goal, W['settle-epsilon']);
    if (!moving) this.lastT = 0;
    const emberOn = this.embers.uniforms['uEmber'].value > 0;
    return this.animate && (moving || emberOn || this.drift);
  }
}
