import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { collapseProgress } from './gestures';

/**
 * iOS-style large title: the h1 sits in the content, and a compact translucent bar fades its
 * own copy of the title in as the page scrolls past it. Projected [barAction] content stays in the bar.
 */
@Component({
  selector: 'bk-large-title',
  template: `
    <div class="bar" [class.scrolled]="progress() >= 1">
      <span class="compact-title" aria-hidden="true" [style.opacity]="progress()">{{
        title()
      }}</span>
      <div class="bar-actions"><ng-content select="[barAction]" /></div>
    </div>
    <h1 class="large" [style.opacity]="1 - progress() * 0.9">{{ title() }}</h1>
  `,
  host: { '(window:scroll)': 'onScroll()' },
  styles: `
    :host {
      display: block;
    }
    .bar {
      position: sticky;
      top: 0;
      z-index: var(--layer-bar);
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      min-height: calc(var(--bar-height) + env(safe-area-inset-top));
      padding: env(safe-area-inset-top) var(--space-4) 0;
      margin: 0 calc(var(--gutter) * -1);
      border-bottom: 1px solid transparent;
      transition:
        background-color var(--dur-base) var(--ease-out),
        border-color var(--dur-base) var(--ease-out);
    }
    .bar.scrolled {
      background: color-mix(in srgb, var(--color-bar) calc(var(--bar-alpha) * 100%), transparent);
      backdrop-filter: saturate(1.4) blur(var(--bar-blur));
      -webkit-backdrop-filter: saturate(1.4) blur(var(--bar-blur));
      border-bottom-color: var(--color-hairline);
    }
    .compact-title {
      grid-column: 2;
      font-family: var(--type-headline-family);
      font-size: var(--type-headline-size);
      font-weight: var(--type-headline-weight);
      color: var(--color-text);
      white-space: nowrap;
    }
    .bar-actions {
      grid-column: 3;
      justify-self: end;
      display: flex;
    }
    .large {
      font-family: var(--type-large-title-family);
      font-size: var(--type-large-title-size);
      line-height: var(--type-large-title-line);
      color: var(--color-text-heading);
      padding: var(--space-1) 0 var(--space-3);
    }
    @media (prefers-reduced-transparency: reduce) {
      .bar.scrolled {
        background: var(--color-bar);
        backdrop-filter: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LargeTitleComponent {
  readonly title = input.required<string>();
  private readonly win = inject(DOCUMENT).defaultView;
  // Seeded from the current position so a restored scroll shows the right bar at once.
  private readonly scrollY = signal(this.win?.scrollY ?? 0);
  readonly progress = computed(() => collapseProgress(this.scrollY()));

  onScroll(): void {
    this.scrollY.set(this.win?.scrollY ?? 0);
  }
}
