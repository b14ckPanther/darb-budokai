import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LargeTitleComponent } from './large-title.component';

/** A list screen: large collapsing title, safe-area gutters and a readable width. */
@Component({
  selector: 'bk-screen',
  imports: [LargeTitleComponent],
  template: `
    <div class="wrap">
      <bk-large-title [title]="title()"
        ><ng-content select="[barAction]" ngProjectAs="[barAction]"
      /></bk-large-title>
      @if (lede()) {
        <p class="lede">{{ lede() }}</p>
      }
      <ng-content />
    </div>
  `,
  styleUrl: './screen.component.scss',
  styles: `
    :host {
      display: block;
      --gutter: max(var(--space-4), env(safe-area-inset-left));
    }
    .wrap {
      max-width: calc(var(--content-max) + 2 * var(--gutter));
      margin: 0 auto;
      padding: 0 var(--gutter) var(--space-12);
    }
    .lede {
      max-width: var(--measure);
      margin: calc(var(--space-2) * -1) 0 var(--space-6);
      color: var(--color-text-secondary);
      font-size: var(--type-callout-size);
      line-height: var(--type-callout-line);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenComponent {
  readonly title = input.required<string>();
  readonly lede = input<string>();
}
