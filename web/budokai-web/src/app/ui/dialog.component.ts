import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { ButtonComponent, ButtonVariant } from './button.component';

let nextId = 0;

/**
 * Confirmation dialog on the native <dialog> element: the browser gives focus trapping, Escape
 * and the inert background. Use only when an action needs protected focus.
 */
@Component({
  selector: 'bk-dialog',
  imports: [ButtonComponent],
  template: `
    <dialog
      #dlg
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
      (close)="open.set(false)"
    >
      <h2 [id]="titleId">{{ title() }}</h2>
      <div class="body"><ng-content /></div>
      <div class="actions">
        <button bk-button variant="secondary" type="button" (click)="open.set(false)">
          {{ cancelLabel }}
        </button>
        <button bk-button [variant]="confirmVariant()" type="button" (click)="confirm()">
          {{ confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
  styles: `
    dialog {
      width: min(26rem, calc(100vw - 2 * var(--space-4)));
      padding: var(--space-6);
      border: 1px solid var(--color-hairline-strong);
      border-radius: var(--radius-xl);
      background: var(--color-surface-raised);
      color: var(--color-text);
      box-shadow: var(--elevation-3);
    }
    dialog[open] {
      animation: rise var(--spring-snappy-dur) var(--spring-snappy);
    }
    dialog::backdrop {
      background: color-mix(
        in srgb,
        var(--color-scrim) calc(var(--scrim-alpha) * 100%),
        transparent
      );
    }
    h2 {
      font-family: var(--type-title-2-family);
      font-size: var(--type-title-2-size);
      line-height: var(--type-title-2-line);
      color: var(--color-text-heading);
    }
    .body {
      margin: var(--space-3) 0 var(--space-6);
      color: var(--color-text-secondary);
      font-size: var(--type-callout-size);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    @keyframes rise {
      from {
        transform: translateY(12px) scale(0.98);
        opacity: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly confirmVariant = input<ButtonVariant>('danger');
  readonly confirmed = output<void>();
  readonly cancelLabel = COPY.ui.cancel;
  readonly titleId = `bk-dialog-${++nextId}`;
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.open() && !d.open) d.showModal();
      if (!this.open() && d.open) d.close();
    });
  }

  confirm(): void {
    this.confirmed.emit();
    this.open.set(false);
  }

  onCancel(e: Event): void {
    e.preventDefault();
    this.open.set(false);
  }
}
