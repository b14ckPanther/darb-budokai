import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONS, IconName } from '../design/icons.generated';

/** The only way to draw an icon. Names come from config/design/icons.yaml (ADR-033). */
@Component({
  selector: 'bk-icon',
  template: `<svg
    viewBox="0 0 24 24"
    [attr.width]="size()"
    [attr.height]="size()"
    [attr.aria-hidden]="label() ? null : 'true'"
    [attr.role]="label() ? 'img' : null"
    [attr.aria-label]="label() ?? null"
    focusable="false"
    [innerHTML]="body()"
  ></svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
    svg {
      width: var(--icon-size, 1.375rem);
      height: var(--icon-size, 1.375rem);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly name = input.required<IconName>();
  readonly label = input<string>();
  readonly size = input<number | null>(null);
  // Bodies are build-time constants from the registry, never user input.
  readonly body = computed(() => this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()].body));
}
