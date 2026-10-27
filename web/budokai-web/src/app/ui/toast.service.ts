import { Injectable, signal } from '@angular/core';
import { IconName } from '../design/icons.generated';
import { TOKENS } from '../design/tokens.generated';

export interface Toast {
  id: number;
  message: string;
  icon: IconName;
}

/**
 * Live effect toasts (Phase 7 feeds them from STOMP). Each auto-dismisses after the token
 * duration, but the clock stops while the pointer or focus is on the toast region (WCAG 2.2.1).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;
  private held = false;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string, icon: IconName): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, message, icon }]);
    if (!this.held) this.arm(id);
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }

  /** Pause (true) or resume (false) every auto-dismiss clock. */
  hold(on: boolean): void {
    this.held = on;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    if (!on) this.toasts().forEach((t) => this.arm(t.id));
  }

  private arm(id: number): void {
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), TOKENS.motion.duration.toast),
    );
  }
}
