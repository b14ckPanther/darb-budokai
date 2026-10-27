import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { SpellbookStore } from '../../data/spellbook.store';
import { GradeName } from '../../game/sm2';
import { ButtonComponent } from '../../ui/button.component';
import { IconComponent } from '../../ui/icon.component';
import { ToastService } from '../../ui/toast.service';

const KEYS: Record<string, GradeName> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };

/** Review session: one card at a time, Space reveals, 1 to 4 grade, each grade shows its next interval. */
@Component({
  selector: 'bk-review-screen',
  imports: [RouterLink, ButtonComponent, IconComponent],
  templateUrl: './review-screen.component.html',
  styleUrl: './review-screen.component.scss',
  host: { '(document:keydown)': 'onKey($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewScreenComponent implements OnInit {
  readonly deck = input.required<string>();
  readonly store = inject(SpellbookStore);
  private readonly toasts = inject(ToastService);
  readonly s = COPY.spellbook;
  readonly session = this.store.session;
  readonly card = this.store.current;
  readonly title = computed(() =>
    format(this.s['session-title'], { school: this.store.deckName() }),
  );
  readonly position = computed(() => {
    const ses = this.session();
    return ses
      ? format(this.s['card-of'], {
          index: Math.min(ses.index + 1, ses.queue.length),
          total: ses.queue.length,
        })
      : '';
  });
  readonly summary = computed(() => {
    const ses = this.session();
    return ses
      ? format(this.s['session-summary'], { reviewed: ses.reviewed, correct: ses.correct })
      : '';
  });
  readonly keys = Object.keys(KEYS);

  ngOnInit(): void {
    this.store.start(this.deck());
  }

  reveal(): void {
    this.store.reveal();
  }

  grade(g: GradeName): void {
    const r = this.store.grade(g);
    if (r.learned)
      this.toasts.show(format(this.s['spell-learned'], { school: this.store.deckName() }), 'ember');
  }

  label(g: GradeName): string {
    return this.s.grades[g];
  }

  next(days: number): string {
    return format(this.s['next-in'], { days });
  }

  nextLabel(days: number): string {
    return format(this.s['next-in-label'], { days });
  }

  keyFor(i: number): string {
    return this.keys[i];
  }

  onKey(e: KeyboardEvent): void {
    if (
      !this.card() ||
      e.defaultPrevented ||
      (e.target as HTMLElement)?.closest?.('input, textarea, select')
    )
      return;
    if ((e.key === ' ' || e.key === 'Enter') && !this.session()?.revealed) {
      // Space and Enter on a focused button already click it.
      if ((e.target as HTMLElement)?.closest?.('button, a')) return;
      e.preventDefault();
      this.reveal();
    } else if (this.session()?.revealed && KEYS[e.key]) {
      e.preventDefault();
      this.grade(KEYS[e.key]);
    }
  }
}
