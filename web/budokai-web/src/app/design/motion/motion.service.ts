import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type MotionPreference = 'system' | 'reduced' | 'full';

const STORAGE_KEY = 'budokai.motion';
const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Reduced motion = the OS setting unless the in-app override says otherwise. The result is
 * mirrored to <html data-motion> so CSS and the 3D engine read one source.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly doc = inject(DOCUMENT);
  private readonly os = signal(false);
  readonly preference = signal<MotionPreference>(this.load());
  readonly reduced = computed(() => {
    const p = this.preference();
    return p === 'system' ? this.os() : p === 'reduced';
  });

  constructor() {
    const win = this.doc.defaultView;
    const mql = win?.matchMedia?.(QUERY);
    if (mql) {
      this.os.set(mql.matches);
      mql.addEventListener('change', (e) => this.os.set(e.matches));
    }
    effect(() => {
      this.doc.documentElement.dataset['motion'] = this.reduced() ? 'reduced' : 'full';
    });
  }

  setPreference(p: MotionPreference): void {
    this.preference.set(p);
    try {
      this.doc.defaultView?.localStorage.setItem(STORAGE_KEY, p);
    } catch {
      // Storage blocked: the choice lasts for this session only.
    }
  }

  private load(): MotionPreference {
    try {
      const v = this.doc.defaultView?.localStorage.getItem(STORAGE_KEY);
      return v === 'reduced' || v === 'full' ? v : 'system';
    } catch {
      return 'system';
    }
  }
}
