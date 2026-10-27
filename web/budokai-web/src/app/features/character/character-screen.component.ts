import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { CharacterStore } from '../../data/character.store';
import { ButtonComponent } from '../../ui/button.component';
import { IconComponent } from '../../ui/icon.component';
import { MeterComponent } from '../../ui/meter.component';
import { RarityComponent } from '../../ui/rarity.component';
import { ScreenComponent } from '../../ui/screen.component';
import { StatDialComponent } from '../../ui/stat-dial.component';

/** Character Sheet (UI_DESIGN 2.2). Every number on it is written out with its label. */
@Component({
  selector: 'bk-character-screen',
  imports: [
    RouterLink,
    ButtonComponent,
    IconComponent,
    MeterComponent,
    RarityComponent,
    ScreenComponent,
    StatDialComponent,
  ],
  templateUrl: './character-screen.component.html',
  styleUrl: './character-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterScreenComponent {
  readonly store = inject(CharacterStore);
  readonly copy = COPY.character;
  readonly c = this.store.character;
  readonly level = computed(() => format(this.copy.level, { level: this.c().level }));
  readonly xp = computed(() =>
    format(this.copy['xp-value'], {
      value: this.c().xp - this.c().xpLevelStart,
      max: this.c().xpNext - this.c().xpLevelStart,
    }),
  );
  readonly stamina = computed(() =>
    format(this.copy['stamina-value'], { value: this.c().stamina, max: this.c().staminaMax }),
  );
  readonly status = computed(() => this.copy.status[this.c().status]);
  readonly portrait = computed(() => format(this.copy.portrait, { name: this.c().name }));
  readonly equippedIds = computed(
    () =>
      new Set(
        this.store
          .equipment()
          .map((e) => e.item?.id)
          .filter(Boolean),
      ),
  );

  rankXp(s: { xp: number; xpNext: number }): string {
    return format(this.copy['rank-xp'], { value: s.xp, max: s.xpNext });
  }

  plus(amount: number): string {
    return format(this.copy.plus, { amount });
  }

  dropped(i: { from: string; date: string }): string {
    return format(this.copy.dropped, { from: i.from, date: i.date });
  }

  earned(date: string): string {
    return format(this.copy.earned, { date });
  }

  replayDate(ref: string): string {
    return ref.split('#')[0];
  }
}
