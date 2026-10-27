import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconName } from '../design/icons.generated';
import { IconComponent } from './icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

/** Native button or link with the brand's pressed-state spring. Always at least 44 points. */
@Component({
  selector: 'button[bk-button], a[bk-button]',
  imports: [IconComponent],
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    } @else if (icon()) {
      <bk-icon [name]="icon()!" />
    }
    <span class="label"><ng-content /></span>
  `,
  host: {
    '[class]': "'bk-button bk-button--' + variant()",
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.disabled]': 'loading() || disabled() ? true : null',
  },
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly icon = input<IconName>();
  readonly loading = input(false);
  readonly disabled = input(false);
}
