import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { SpellbookStore } from '../../data/spellbook.store';
import { ButtonComponent } from '../../ui/button.component';
import { IconComponent } from '../../ui/icon.component';
import { ScreenComponent } from '../../ui/screen.component';

/** Spellbook shelf (UI_DESIGN 2.6): each deck is a school, shown as a tome. */
@Component({
  selector: 'bk-spellbook-screen',
  imports: [RouterLink, ButtonComponent, IconComponent, ScreenComponent],
  template: `
    <bk-screen [title]="s.title" [lede]="s.lede">
      <ul class="shelf">
        @for (d of store.schools(); track d.id) {
          <li class="tome">
            <div class="spine" aria-hidden="true"><bk-icon name="lore" /></div>
            <div class="body">
              <h2>{{ d.school }}</h2>
              <p class="deck">{{ d.name }}, {{ f(s.cards, d.total) }}</p>
              <ul class="counts">
                <li class="due"><bk-icon name="time" />{{ f(s.due, d.due) }}</li>
                <li><bk-icon name="ember" />{{ f(s.mastered, d.mastered) }}</li>
                <li><bk-icon name="check" />{{ f(s.learned, d.learned) }}</li>
                <li class="fading"><bk-icon name="warning" />{{ f(s.fading, d.fading) }}</li>
              </ul>
              @if (d.due > 0) {
                <a bk-button variant="primary" icon="play" [routerLink]="['/spellbook', d.id]">{{
                  s.review
                }}</a>
              } @else {
                <p class="rest">{{ s['nothing-due'] }}</p>
              }
            </div>
          </li>
        }
      </ul>
    </bk-screen>
  `,
  styleUrl: './spellbook-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellbookScreenComponent {
  readonly store = inject(SpellbookStore);
  readonly s = COPY.spellbook;

  f(t: string, count: number): string {
    return format(t, { count });
  }
}
