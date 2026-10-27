import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { Detent, sheetRelease } from './gestures';
import { IconComponent } from './icon.component';

let nextId = 0;
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
          (pointercancel)="onUp($event)"
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
  private startY = 0;
  private lastY = 0;
  private lastT = 0;
  private velocity = 0;

  constructor() {
    effect(() => {
      const p = this.panel();
      if (p) {
        this.opener ??= this.doc.activeElement as HTMLElement | null;
        p.nativeElement.focus();
        this.doc.body.style.overflow = 'hidden';
      }
    });
    effect(() => {
      if (!this.open()) {
        this.doc.body.style.overflow = '';
        this.opener?.focus?.();
        this.opener = null;
      }
    });
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
    const items = Array.from(
      this.panel()?.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && this.doc.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && this.doc.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  onDown(e: PointerEvent): void {
    if ((e.target as HTMLElement).closest('button.close')) return;
    this.dragging.set(true);
    this.startY = this.lastY = e.clientY;
    this.lastT = e.timeStamp;
    this.velocity = 0;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  onMove(e: PointerEvent): void {
    if (!this.dragging()) return;
    const dt = e.timeStamp - this.lastT;
    if (dt > 0) this.velocity = (e.clientY - this.lastY) / dt;
    this.lastY = e.clientY;
    this.lastT = e.timeStamp;
    const dy = e.clientY - this.startY;
    // Rubber-band upward drags so the sheet never leaves the screen edge.
    this.dragY.set(dy < 0 ? dy / 4 : dy);
  }

  onUp(e: PointerEvent): void {
    if (!this.dragging()) return;
    this.dragging.set(false);
    const dragPx = e.clientY - this.startY;
    const height = this.doc.defaultView?.innerHeight ?? 800;
    const outcome = sheetRelease({ from: this.detent(), dragPx, velocity: this.velocity, height });
    this.dragY.set(0);
    if (outcome === 'dismiss') this.close();
    else this.detent.set(outcome);
  }
}
