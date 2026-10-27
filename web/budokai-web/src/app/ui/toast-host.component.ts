import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { IconComponent } from './icon.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'bk-toast-host',
  imports: [IconComponent],
  template: `
    <div class="stack" role="status" aria-live="polite">
      @for (t of svc.toasts(); track t.id) {
        <div class="toast">
          <bk-icon [name]="t.icon" />
          <span class="msg">{{ t.message }}</span>
          <button type="button" class="dismiss" (click)="svc.dismiss(t.id)">
            <bk-icon name="close" [label]="dismissLabel" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      z-index: var(--layer-toast);
      top: max(var(--space-3), env(safe-area-inset-top));
      left: 50%;
      translate: -50% 0;
      display: grid;
      gap: var(--space-2);
      width: min(24rem, calc(100vw - 2 * var(--space-4)));
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--color-surface-raised) 92%, transparent);
      backdrop-filter: blur(var(--bar-blur));
      -webkit-backdrop-filter: blur(var(--bar-blur));
      border: 1px solid var(--color-hairline-strong);
      box-shadow: var(--elevation-2);
      color: var(--color-text);
      font-size: var(--type-subhead-size);
      animation: drop var(--spring-bouncy-dur) var(--spring-bouncy);
      --icon-size: 1.25rem;
    }
    .toast > bk-icon {
      color: var(--color-ki-hot);
    }
    .msg {
      flex: 1;
    }
    .dismiss {
      display: grid;
      place-items: center;
      width: var(--touch-target);
      height: var(--touch-target);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    @keyframes drop {
      from {
        transform: translateY(-16px);
        opacity: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  readonly svc = inject(ToastService);
  readonly dismissLabel = COPY.ui['toast-dismiss'];
}
