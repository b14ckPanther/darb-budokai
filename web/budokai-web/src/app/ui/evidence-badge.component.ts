import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { IconName } from '../design/icons.generated';
import { IconComponent } from './icon.component';

export type EvidenceTier = keyof typeof COPY.evidence;

const SIGIL: Record<EvidenceTier, IconName> = {
  verified: 'verified',
  attested: 'attested',
  self_reported: 'self-reported',
  simulated: 'simulated',
};

/** How much a reward can be trusted (GAME_DESIGN section 8): sigil shape plus word. */
@Component({
  selector: 'bk-evidence',
  imports: [IconComponent],
  template: `<bk-icon [name]="sigil()" /><span>{{ text().label }}</span>`,
  host: { '[attr.title]': 'text().hint', '[class]': "'tier-' + tier()" },
  styles: `
    :host {
      --icon-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 0.125rem var(--space-2) 0.125rem 0.375rem;
      border-radius: var(--radius-pill);
      border: 1px solid var(--color-hairline);
      font-size: var(--type-caption-size);
      font-weight: var(--type-caption-weight);
      line-height: 1.4;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    :host(.tier-verified) {
      color: var(--color-text-gold);
      border-color: var(--color-hairline-strong);
      background: var(--color-accent-soft);
    }
    :host(.tier-attested) {
      color: var(--color-stone);
    }
    :host(.tier-simulated) {
      border-style: dashed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceBadgeComponent {
  readonly tier = input.required<EvidenceTier>();
  readonly sigil = computed(() => SIGIL[this.tier()]);
  readonly text = computed(() => COPY.evidence[this.tier()]);
}
