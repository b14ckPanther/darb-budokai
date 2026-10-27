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
  ></canvas>`,
  styles: `
    :host {
      display: block;
      position: relative;
      background: var(--color-bg-deep);
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
