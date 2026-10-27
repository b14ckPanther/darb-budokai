import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { IconName } from '../design/icons.generated';
import { IconComponent } from './icon.component';

export type Rarity = keyof typeof COPY.rarity;

/** Rarity by shape and word. No rainbow: the colour only gets warmer toward legendary. */
@Component({
  selector: 'bk-rarity',
  imports: [IconComponent],
  template: `<bk-icon [name]="sigil()" /><span>{{ label() }}</span>`,
  host: { '[class]': "'r-' + rarity()" },
  styles: `
    :host {
      --icon-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--type-caption-size);
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--color-text-secondary);
    }
    :host(.r-rare) {
      color: var(--color-stone);
    }
    :host(.r-epic) {
      color: var(--color-text-gold);
    }
    :host(.r-legendary) {
      color: var(--color-text-heading);
    }
    :host(.r-legendary) bk-icon {
      color: var(--color-ki-hot);
      filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-ki) 70%, transparent));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RarityComponent {
  readonly rarity = input.required<Rarity>();
  readonly sigil = computed(() => `rarity-${this.rarity()}` as IconName);
  readonly label = computed(() => COPY.rarity[this.rarity()]);
}
