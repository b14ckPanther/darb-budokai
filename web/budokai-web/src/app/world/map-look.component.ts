import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { format } from '../copy/format';
import { MotionService } from '../design/motion/motion.service';
import { webglAvailable } from './webgl';
import { TOKENS } from '../design/tokens.generated';
import type { WorldScene } from './engine/world-scene';

export type LightLevel = keyof typeof TOKENS.map.levels;

/** Canvas host for the map look test. Three.js runs outside Angular's zone and is lazy-loaded. */
@Component({
  selector: 'bk-map-look',
  template: `
    <canvas #canvas [attr.aria-label]="label()" role="img" [hidden]="unsupported()"></canvas>
    @if (unsupported()) {
      <p class="fallback">{{ label() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      aspect-ratio: 16 / 10;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-bg-deep);
      box-shadow: inset 0 0 0 1px var(--color-hairline);
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .fallback {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: var(--space-4);
      color: var(--color-text-secondary);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapLookComponent {
  readonly level = input<LightLevel>('active');
  readonly unsupported = signal(false);
  readonly label = computed(() =>
    format(COPY.design.samples['map-label'], {
      level: COPY.design.samples[`level-${this.level()}`],
    }),
  );
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly motion = inject(MotionService);
  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly scene = signal<WorldScene | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!webglAvailable()) {
        this.unsupported.set(true);
        return;
      }
      let destroyed = false;
      destroyRef.onDestroy(() => (destroyed = true));
      this.zone.runOutsideAngular(async () => {
        const { WorldScene } = await import('./engine/world-scene');
        // The component may be gone by the time the chunk arrives: create nothing then.
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
        this.scene.set(s);
      });
    });
    effect(() => this.scene()?.setGlobal(TOKENS.map.levels[this.level()]));
    effect(() => this.scene()?.setAnimate(!this.motion.reduced()));
  }
}
