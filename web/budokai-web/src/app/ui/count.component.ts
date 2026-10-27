import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { MotionService } from '../design/motion/motion.service';
import { TOKENS } from '../design/tokens.generated';

/** A number that ticks up to its value over the counter duration (instant under reduced motion). */
@Component({
  selector: 'bk-count',
  template: `<span aria-hidden="true">{{ shown() }}</span
    ><span class="visually-hidden">{{ text() }}</span>`,
  styles: `
    :host {
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountComponent {
  readonly value = input.required<number>();
  readonly text = input.required<string>();
  readonly format = input<(n: number) => string>((n) => String(n));
  readonly shown = signal('');
  private readonly motion = inject(MotionService);
  private frame = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
    effect(() => {
      const to = this.value();
      const fmt = this.format();
      cancelAnimationFrame(this.frame);
      if (this.motion.reduced() || typeof requestAnimationFrame === 'undefined') {
        this.shown.set(fmt(to));
        return;
      }
      const dur = TOKENS.motion.duration.counter;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        const v = to * eased;
        this.shown.set(fmt(Number.isInteger(to) ? Math.round(v) : Math.round(v * 10) / 10));
        if (k < 1) this.frame = requestAnimationFrame(step);
      };
      this.shown.set(fmt(0));
      this.frame = requestAnimationFrame(step);
    });
  }
}
