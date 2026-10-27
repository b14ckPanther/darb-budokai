import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { format } from '../copy/format';
import { IconComponent } from './icon.component';

export type StatId = keyof typeof COPY.stats;

/** An engraved dial: the stat's sigil, its rank, and progress to the next rank as a gold arc. */
@Component({
  selector: 'bk-stat-dial',
  imports: [IconComponent],
  template: `
    <div
      class="dial"
      role="progressbar"
      [attr.aria-label]="name() + ', ' + rankText()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="pct()"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle class="ticks" cx="32" cy="32" r="29" pathLength="60" />
        <circle class="groove" cx="32" cy="32" r="25" />
        <circle
          class="arc"
          cx="32"
          cy="32"
          r="25"
          pathLength="100"
          [attr.stroke-dasharray]="pct() + ' 100'"
        />
      </svg>
      <bk-icon [name]="stat()" />
    </div>
    <div class="text">
      <span class="name">{{ name() }}</span>
      <span class="rank">{{ rankText() }}</span>
      <span class="meaning">{{ meaning() }}</span>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      --icon-size: 1.75rem;
    }
    .dial {
      position: relative;
      width: 4.25rem;
      height: 4.25rem;
      flex: none;
      display: grid;
      place-items: center;
      color: var(--color-text-heading);
    }
    svg {
      position: absolute;
      inset: 0;
      transform: rotate(-90deg);
    }
    circle {
      fill: none;
    }
    .ticks {
      stroke: var(--color-hairline-strong);
      stroke-width: 1.5;
      stroke-dasharray: 0.4 0.6;
    }
    .groove {
      stroke: var(--color-surface-sunken);
      stroke-width: 4;
    }
    .arc {
      stroke: var(--color-accent);
      stroke-width: 4;
      stroke-linecap: round;
      transition: stroke-dasharray var(--spring-gentle-dur) var(--spring-gentle);
    }
    .text {
      display: grid;
      min-width: 0;
    }
    .name {
      font-family: var(--type-title-2-family);
      font-size: var(--type-title-2-size);
      line-height: var(--type-title-2-line);
      color: var(--color-text-heading);
    }
    .rank {
      font-size: var(--type-subhead-size);
      font-weight: 600;
      color: var(--color-text-gold);
    }
    .meaning {
      font-size: var(--type-footnote-size);
      color: var(--color-text-secondary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatDialComponent {
  readonly stat = input.required<StatId>();
  readonly rank = input.required<number>();
  readonly progress = input.required<number>();
  readonly name = computed(() => COPY.stats[this.stat()].name);
  readonly meaning = computed(() => COPY.stats[this.stat()].meaning);
  readonly rankText = computed(() => format(COPY.character.rank, { rank: this.rank() }));
  readonly pct = computed(() => Math.round(Math.min(1, Math.max(0, this.progress())) * 100));
}
