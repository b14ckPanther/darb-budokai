import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { TOKENS } from '../design/tokens.generated';
import { Detent, beyondSlop, releaseVelocity, sheetRelease } from './gestures';
import { IconComponent } from './icon.component';

let nextId = 0;
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type=hidden])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Bottom sheet with medium and large detents, drag-to-dismiss and a spring settle, like a
 * SwiftUI sheet. Modal: focus moves in, Tab is trapped, Escape closes, focus returns on close.
 */
@Component({
  selector: 'bk-sheet',
  imports: [IconComponent],
  template: `
    @if (open()) {
      <div class="scrim" aria-hidden="true" (click)="close()"></div>
      <div
        #panel
        class="panel"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-labelledby]="titleId"
        [class.dragging]="dragging()"
        [style.height]="heightCss()"
        [style.transform]="dragY() ? 'translateY(' + dragY() + 'px)' : null"
        (keydown)="onKey($event)"
      >
        <div
          class="grab"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp($event)"
          (pointercancel)="onCancel()"
        >
          <button
            type="button"
            class="handle"
            [attr.aria-label]="detent() === 'large' ? copy['sheet-collapse'] : copy['sheet-expand']"
            [attr.aria-expanded]="detent() === 'large'"
            (click)="toggleDetent()"
          >
            <span aria-hidden="true"></span>
          </button>
          <div class="header">
            <h2 [id]="titleId">{{ title() }}</h2>
            <button type="button" class="close" (click)="close()">
              <bk-icon name="close" [label]="copy.close" />
            </button>
          </div>
        </div>
        <div class="body"><ng-content /></div>
      </div>
    }
  `,
  styleUrl: './sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly open = model(false);
  readonly detent = model<Detent>('medium');
  readonly title = input.required<string>();
  readonly copy = COPY.ui;
  readonly titleId = `bk-sheet-${++nextId}`;
  readonly dragging = signal(false);
  readonly dragY = signal(0);
  readonly heightCss = computed(() => `${TOKENS.gesture['sheet-detents'][this.detent()] * 100}dvh`);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private opener: HTMLElement | null = null;
  private restoreInert: (() => void) | null = null;
  private pressed = false;
  private startY = 0;
  private samples: { t: number; y: number }[] = [];

  constructor() {
    effect(() => {
      const p = this.panel();
      if (p) {
        this.opener ??= this.doc.activeElement as HTMLElement | null;
        this.restoreInert ??= inertOthers(this.host.nativeElement);
        p.nativeElement.focus();
        this.doc.body.style.overflow = 'hidden';
      }
    });
    effect(() => {
      if (!this.open()) this.restorePage(true);
    });
    // Removed while open (route change, @if): never leave the page inert or locked.
    inject(DestroyRef).onDestroy(() => this.restorePage(false));
  }

  close(): void {
    this.dragY.set(0);
    this.open.set(false);
  }

  toggleDetent(): void {
    this.detent.set(this.detent() === 'large' ? 'medium' : 'large');
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.close();
      return;
    }
    if (e.key !== 'Tab') return;
    const panel = this.panel()?.nativeElement;
    const items = Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.doc.activeElement;
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  onDown(e: PointerEvent): void {
    if ((e.target as HTMLElement).closest('button.close')) return;
    this.pressed = true;
    this.startY = e.clientY;
    this.samples = [{ t: e.timeStamp, y: e.clientY }];
  }

  onMove(e: PointerEvent): void {
    if (!this.pressed) return;
    const dy = e.clientY - this.startY;
    // Capture only once the press is a real drag, so a tap still clicks the handle button.
    if (!this.dragging()) {
      if (!beyondSlop(0, dy)) return;
      this.dragging.set(true);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    this.samples.push({ t: e.timeStamp, y: e.clientY });
    // Rubber-band upward drags so the sheet never leaves the screen edge.
    this.dragY.set(dy < 0 ? dy / 4 : dy);
  }

  onUp(e: PointerEvent): void {
    this.pressed = false;
    if (!this.dragging()) return;
    this.dragging.set(false);
    this.samples.push({ t: e.timeStamp, y: e.clientY });
    const dragPx = e.clientY - this.startY;
    const height = this.doc.defaultView?.innerHeight ?? 0;
    const outcome = sheetRelease({
      from: this.detent(),
      dragPx,
      velocity: releaseVelocity(this.samples),
      height,
    });
    this.dragY.set(0);
    if (outcome === 'dismiss') this.close();
    else this.detent.set(outcome);
  }

  onCancel(): void {
    this.pressed = false;
    this.dragging.set(false);
    this.dragY.set(0);
  }

  private restorePage(returnFocus: boolean): void {
    this.doc.body.style.overflow = '';
    this.restoreInert?.();
    this.restoreInert = null;
    if (returnFocus) this.opener?.focus?.();
    this.opener = null;
  }
}

/** Makes everything outside `el` inert (like a native modal) and returns a function that undoes it. */
export function inertOthers(el: HTMLElement): () => void {
  const changed: HTMLElement[] = [];
  for (let node: HTMLElement | null = el; node && node.parentElement; node = node.parentElement) {
    for (const sib of Array.from(node.parentElement.children) as HTMLElement[]) {
      if (sib !== node && !sib.inert && !['SCRIPT', 'STYLE'].includes(sib.tagName)) {
        sib.inert = true;
        changed.push(sib);
      }
    }
  }
  return () => changed.forEach((s) => (s.inert = false));
}
