import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A labelled bar for XP (gold) or stamina (ki light). The value is always written out. */
@Component({
  selector: 'bk-meter',
  template: `
    <div class="head">
      <span class="label">{{ label() }}</span>
      <span class="value">{{ valueText() }}</span>
    </div>
    <div
      class="track"
      role="progressbar"
      [attr.aria-label]="label()"
      aria-valuemin="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuetext]="valueText()"
    >
      <div class="fill" [style.inline-size.%]="percent()"></div>
    </div>
  `,
  host: { '[class]': "'tone-' + tone()" },
  styles: `
    :host {
      display: grid;
      gap: var(--space-2);
    }
    .head {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      font-size: var(--type-footnote-size);
      line-height: var(--type-footnote-line);
    }
    .label {
      color: var(--color-text-secondary);
    }
    .value {
      color: var(--color-text);
      font-variant-numeric: tabular-nums;
    }
    .track {
      position: relative;
      height: 0.5rem;
      border-radius: var(--radius-pill);
      background: var(--color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--color-hairline);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: inherit;
      transition: inline-size var(--spring-gentle-dur) var(--spring-gentle);
    }
    :host(.tone-xp) .fill {
      background: linear-gradient(
        90deg,
        var(--color-accent-pressed),
        var(--color-accent) 70%,
        var(--color-text-heading)
      );
    }
    :host(.tone-stamina) .fill {
      background: linear-gradient(90deg, var(--color-ki), var(--color-ki-hot));
      box-shadow: 0 0 12px color-mix(in srgb, var(--color-ki) 55%, transparent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeterComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input.required<number>();
  readonly valueText = input.required<string>();
  readonly tone = input<'xp' | 'stamina'>('xp');
  readonly percent = computed(() => {
    const m = this.max();
    return m > 0 ? Math.min(100, Math.max(0, (this.value() / m) * 100)) : 0;
  });
}
