/**
 * Skill tree constellation (Gold Orrery look, ADR-038): nodes are stars grouped by stat, edges are
 * thin gold rails, the sky turns slowly. Plain TypeScript; render on demand; token colours exact.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  LinearSRGBColorSpace,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { TOKENS } from '../../design/tokens.generated';
import { RenderScheduler } from './render-scheduler';

const C = TOKENS.themes.dark as Record<string, string>;
const K = TOKENS.skilltree;

export interface StarNode {
  id: string;
  at: readonly number[];
  state: 'locked' | 'available' | 'unlocked';
  requires: readonly string[];
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPx;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPx * aSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.18, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.45;
    float a = core + halo;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

export class ConstellationScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(40, 1, 0.1, 200);
  private readonly stars: ShaderMaterial;
  private readonly scheduler: RenderScheduler;
  private readonly disposables: { dispose(): void }[] = [];
  private animate = true;
  private angle = 0;
  private last = 0;
  private readonly extent: [number, number];

  constructor(canvas: HTMLCanvasElement, nodes: StarNode[]) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    const bg = rgb(C['bg-deep']);
    this.renderer.setClearColor(new Color().setRGB(bg[0], bg[1], bg[2], LinearSRGBColorSpace));

    const pos = new Float32Array(nodes.length * 3);
    const size = new Float32Array(nodes.length);
    const col = new Float32Array(nodes.length * 3);
    const tone = { locked: rgb(C['fog']), available: rgb(C['ki-hot']), unlocked: rgb(C['accent']) };
    const pad = K['frame-padding'];
    this.extent = [
      Math.max(...nodes.map((n) => Math.abs(n.at[0]))) + pad,
      Math.max(...nodes.map((n) => Math.abs(n.at[1]))) + pad,
    ];
    nodes.forEach((n, i) => {
      pos.set(n.at as number[], i * 3);
      size[i] = K['node-size'][n.state];
      col.set(tone[n.state], i * 3);
    });
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSize', new BufferAttribute(size, 1));
    g.setAttribute('aColor', new BufferAttribute(col, 3));
    this.stars = new ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uPx: { value: 400 } },
    });

    const byId = new Map(nodes.map((n) => [n.id, n]));
    const edges: number[] = [];
    for (const n of nodes)
      for (const r of n.requires) if (byId.has(r)) edges.push(...byId.get(r)!.at, ...n.at);
    const eg = new BufferGeometry();
    eg.setAttribute('position', new BufferAttribute(new Float32Array(edges), 3));
    const gold = rgb(C['hairline-strong']);
    const lines = new LineBasicMaterial({
      color: new Color().setRGB(gold[0], gold[1], gold[2], LinearSRGBColorSpace),
    });

    // A faint field of background stars, deterministic.
    const field = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const a = i * 2.39996;
      const r = 14 + ((i * 7919) % 97) / 9.7;
      field.set([Math.cos(a) * r, ((i * 104729) % 200) / 10 - 10, Math.sin(a) * r - 8], i * 3);
    }
    const fg = new BufferGeometry();
    fg.setAttribute('position', new BufferAttribute(field, 3));
    fg.setAttribute('aSize', new BufferAttribute(new Float32Array(400).fill(0.12), 1));
    fg.setAttribute(
      'aColor',
      new BufferAttribute(
        new Float32Array(400 * 3).fill(0).map((_, i) => rgb(C['stone'])[i % 3] * 0.6),
        3,
      ),
    );

    this.scene.add(
      new LineSegments(eg, lines),
      new Points(g, this.stars),
      new Points(fg, this.stars),
    );
    this.disposables.push(g, eg, fg, lines, this.stars);
    this.camera.position.set(0, 0, 24);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.scheduler = new RenderScheduler(
      (cb) => requestAnimationFrame(cb),
      (h) => cancelAnimationFrame(h),
      (t) => this.draw(t),
    );
    this.scheduler.requestRender();
  }

  setAnimate(on: boolean): void {
    this.animate = on;
    this.scheduler.requestRender();
  }

  setVisible(v: boolean): void {
    this.scheduler.setPaused(!v);
  }

  resize(w: number, h: number, dpr: number): void {
    if (!w || !h) return;
    const r = Math.min(dpr, TOKENS.map['dpr-cap']);
    this.renderer.setPixelRatio(r);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Fit the constellation's width and height (its extent comes from the node positions).
    const halfV = Math.tan(((this.camera.fov / 2) * Math.PI) / 180);
    this.camera.position.z = Math.max(this.extent[1] / halfV, this.extent[0] / (halfV * (w / h)));
    this.camera.updateProjectionMatrix();
    this.stars.uniforms['uPx'].value = h * r * K['star-px'];
    this.scheduler.requestRender();
  }

  dispose(): void {
    this.scheduler.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private draw(t: number): boolean {
    const dt = this.last ? Math.min(t - this.last, 100) : 0;
    this.last = t;
    if (this.animate) this.angle += (K['orbit-deg-per-s'] * dt) / 1000;
    const a = (Math.sin((this.angle * Math.PI) / 180) * 18 * Math.PI) / 180;
    this.scene.rotation.y = a;
    this.renderer.render(this.scene, this.camera);
    return this.animate;
  }
}
