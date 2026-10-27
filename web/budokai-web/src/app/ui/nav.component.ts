import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconName } from '../design/icons.generated';
import { IconComponent } from './icon.component';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

/** One navigation: a translucent bottom tab bar on phones, a side rail from the desktop breakpoint. */
@Component({
  selector: 'bk-nav',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav [attr.aria-label]="label()">
      <img class="mark" src="brand/mark-gold.svg" alt="" width="36" height="36" />
      <ul>
        @for (item of items(); track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              [routerLinkActiveOptions]="{ exact: false }"
            >
              <bk-icon [name]="item.icon" />
              <span>{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  readonly label = input.required<string>();
  readonly items = input.required<NavItem[]>();
}
