import { Injectable, signal } from '@angular/core';
import { IconName } from '../design/icons.generated';
import { TOKENS } from '../design/tokens.generated';

export interface Toast {
  id: number;
  message: string;
  icon: IconName;
}

/** Live effect toasts (Phase 7 feeds them from STOMP). Auto-dismiss after the token duration. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(message: string, icon: IconName): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, message, icon }]);
    setTimeout(() => this.dismiss(id), TOKENS.motion.duration.toast);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
