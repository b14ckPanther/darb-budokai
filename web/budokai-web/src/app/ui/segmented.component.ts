import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  viewChildren,
} from '@angular/core';

export interface SegmentOption {
  value: string;
  label: string;
}

/** Segmented control: a radio group with roving focus (arrows, Home, End), like UISegmentedControl. */
@Component({
  selector: 'bk-segmented',
  template: `
    <div class="track" role="radiogroup" [attr.aria-label]="label()">
      @for (o of options(); track o.value; let i = $index) {
        <button
          #seg
          type="button"
          role="radio"
          class="seg"
          [attr.aria-checked]="o.value === value()"
          [tabIndex]="o.value === value() ? 0 : -1"
          (click)="value.set(o.value)"
          (keydown)="onKey($event, i)"
        >
          {{ o.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .track {
      display: inline-grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: 2px;
      padding: 3px;
      border-radius: var(--radius-md);
      background: var(--color-surface-sunken);
      border: 1px solid var(--color-hairline);
      max-width: 100%;
    }
    :host(.fit) .track {
      grid-auto-columns: max-content;
    }
    .seg {
      min-height: var(--touch-target);
      padding: 0 var(--space-4);
      border: 0;
      border-radius: calc(var(--radius-md) - 3px);
      background: transparent;
      color: var(--color-text-secondary);
      font-size: var(--type-subhead-size);
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition:
        background-color var(--spring-snappy-dur) var(--spring-snappy),
        color var(--dur-fast) var(--ease-out);
    }
    .seg[aria-checked='true'] {
      background: var(--color-surface-raised);
      color: var(--color-text);
      box-shadow:
        var(--elevation-1),
        inset 0 0 0 1px var(--color-hairline);
    }
  `,
  host: { '[class.fit]': 'fit()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedComponent {
  readonly label = input.required<string>();
  /** Size segments to their labels (long or many options) instead of equal widths. */
  readonly fit = input(false);
  readonly options = input.required<SegmentOption[]>();
  readonly value = model.required<string>();
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('seg');

  onKey(e: KeyboardEvent, i: number): void {
    const n = this.options().length;
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (i + 1) % n
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (i - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    this.value.set(this.options()[next].value);
    this.buttons()[next]?.nativeElement.focus();
  }
}
