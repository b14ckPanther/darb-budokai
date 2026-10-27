import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MotionService } from '../design/motion/motion.service';
import type { Pick, SceneMarker, SceneRegion, WorldScene } from './engine/world-scene';

export interface Pulse {
  at: readonly number[];
  strength: number;
}

/**
 * Hosts the Three.js world. The canvas is a picture for pointer users; keyboard and screen-reader
 * users get the DOM twin the screen renders next to it. Three.js loads lazily outside the zone.
 */
@Component({
  selector: 'bk-world-canvas',
  template: `<canvas
      #canvas
      role="img"
      [attr.aria-label]="label()"
      (click)="onClick($event)"
    ></canvas>
    <div class="labels" aria-hidden="true">
      @for (l of labels(); track l.id) {
        <span class="label" [attr.data-label]="l.id">{{ l.name }}</span>
      }
    </div>`,
  styles: `
    :host {
      display: block;
      position: relative;
      background: var(--color-bg-deep);
    }
    .labels {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .label {
      position: absolute;
      left: 0;
      top: 0;
      padding: 0.125rem 0.625rem;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--color-bg) 70%, transparent);
      border: 1px solid var(--color-hairline-strong);
      font-family: var(--type-headline-family);
      font-size: var(--type-footnote-size);
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--color-text-heading);
      white-space: nowrap;
      opacity: 0;
      will-change: transform;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: pointer;
      touch-action: manipulation;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldCanvasComponent {
  readonly label = input.required<string>();
  readonly regions = input<SceneRegion[]>([]);
  readonly markers = input<SceneMarker[]>([]);
  readonly selected = input<string | null>(null);
  readonly focus = input<readonly number[] | null>(null);
  readonly pulse = input<Pulse | null>(null);
  readonly drift = input(false);
  /** Region names to float over the map (decorative; the screen's list is the accessible twin). */
  readonly labels = input<{ id: string; name: string }[]>([]);
  readonly picked = output<Pick>();
  readonly ready = signal(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly motion = inject(MotionService);
  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly scene = signal<WorldScene | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let destroyed = false;
      destroyRef.onDestroy(() => (destroyed = true));
      this.zone.runOutsideAngular(async () => {
        const { WorldScene } = await import('./engine/world-scene');
        if (destroyed) return;
        const host = this.host.nativeElement as HTMLElement;
        const s = new WorldScene(this.canvas().nativeElement);
        let onScreen = true;
        const sync = () => s.setVisible(onScreen && document.visibilityState !== 'hidden');
        const ro = new ResizeObserver(([e]) =>
          s.resize(e.contentRect.width, e.contentRect.height, devicePixelRatio),
        );
        const io = new IntersectionObserver(([e]) => {
          onScreen = e.isIntersecting;
          sync();
        });
        ro.observe(host);
        io.observe(host);
        document.addEventListener('visibilitychange', sync);
        destroyRef.onDestroy(() => {
          ro.disconnect();
          io.disconnect();
          document.removeEventListener('visibilitychange', sync);
          s.dispose();
        });
        // Labels move every frame, so they are written straight to the DOM, outside change detection.
        s.onLabels = (ls) => {
          for (const l of ls) {
            const el = host.querySelector<HTMLElement>(`[data-label="${l.id}"]`);
            if (!el) continue;
            el.style.transform = `translate(${l.x}px, ${l.y}px) translate(-50%, -50%)`;
            el.style.opacity = l.visible ? '1' : '0';
          }
        };
        s.setAnimate(!this.motion.reduced());
        s.setRegions(this.regions());
        s.setMarkers(this.markers(), this.selected());
        s.focus(this.focus(), true);
        this.zone.run(() => {
          this.scene.set(s);
          this.ready.set(true);
        });
      });
    });
    effect(() => this.scene()?.setAnimate(!this.motion.reduced()));
    effect(() => this.scene()?.setRegions(this.regions()));
    effect(() => this.scene()?.setMarkers(this.markers(), this.selected()));
    effect(() => this.scene()?.focus(this.focus()));
    effect(() => {
      const p = this.pulse();
      this.scene()?.pulse(p?.at ?? null, p?.strength ?? 0);
    });
    effect(() => this.scene()?.setIdleDrift(this.drift()));
  }

  onClick(e: MouseEvent): void {
    const s = this.scene();
    if (s) this.picked.emit(s.pick(e.clientX, e.clientY));
  }
}
