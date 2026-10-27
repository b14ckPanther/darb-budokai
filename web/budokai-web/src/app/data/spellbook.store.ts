import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { GradeName, Sm2State, previewGrades, review, spellState } from '../game/sm2';
import { requireData } from './game-data';

export interface SessionCard {
  id: string;
  q: string;
  a: string;
  tags: readonly string[];
  state: ReturnType<typeof spellState>;
}

export interface Session {
  deckId: string;
  queue: SessionCard[];
  index: number;
  revealed: boolean;
  reviewed: number;
  correct: number;
  learned: number;
}

/** Recall in the prototype: SM-2 runs on the client against the demo rulebook; nothing is saved. */
export const SpellbookStore = signalStore(
  { providedIn: 'root' },
  withState(() => {
    const d = requireData();
    const sm2: Record<string, Sm2State> = {};
    for (const deck of d.decks.decks) for (const c of deck.cards) sm2[c.id] = { ...c.sm2 };
    return { sm2, session: null as Session | null };
  }),
  withComputed((store) => {
    const d = requireData();
    const today = d.persona.today;
    const rules = d.rulebook.spells;
    const stateOf = (id: string) => spellState(store.sm2()[id], rules, today);
    return {
      today: computed(() => today),
      schools: computed(() =>
        d.decks.decks.map((deck) => {
          const states = deck.cards.map((c) => stateOf(c.id));
          return {
            id: deck.id,
            name: deck.name,
            school: deck.school,
            total: deck.cards.length,
            due: deck.cards.filter((c) => store.sm2()[c.id].due <= today).length,
            learned: states.filter((s) => s === 'learned').length,
            mastered: states.filter((s) => s === 'mastered').length,
            fading: states.filter((s) => s === 'fading').length,
          };
        }),
      ),
      current: computed(() => {
        const s = store.session();
        return s && s.index < s.queue.length ? s.queue[s.index] : null;
      }),
      preview: computed(() => {
        const s = store.session();
        if (!s || s.index >= s.queue.length) return [];
        return previewGrades(store.sm2()[s.queue[s.index].id], d.rulebook.sm2, today);
      }),
      deckName: computed(
        () => d.decks.decks.find((x) => x.id === store.session()?.deckId)?.school ?? '',
      ),
    };
  }),
  withMethods((store) => {
    const d = requireData();
    const today = d.persona.today;
    return {
      start(deckId: string): void {
        const deck = d.decks.decks.find((x) => x.id === deckId);
        if (!deck) return;
        const queue = deck.cards
          .filter((c) => store.sm2()[c.id].due <= today)
          .map((c) => ({
            id: c.id,
            q: c.q,
            a: c.a,
            tags: c.tags,
            state: spellState(store.sm2()[c.id], d.rulebook.spells, today),
          }));
        patchState(store, {
          session: {
            deckId,
            queue,
            index: 0,
            revealed: false,
            reviewed: 0,
            correct: 0,
            learned: 0,
          },
        });
      },
      reveal(): void {
        const s = store.session();
        if (s) patchState(store, { session: { ...s, revealed: true } });
      },
      grade(grade: GradeName): { learned: boolean; interval: number } {
        const s = store.session();
        if (!s || !s.revealed || s.index >= s.queue.length) return { learned: false, interval: 0 };
        const card = s.queue[s.index];
        const q = d.rulebook.sm2.grades[grade];
        const next = review(store.sm2()[card.id], q, d.rulebook.sm2, today);
        const passed = q >= d.rulebook.sm2.passGrade;
        const learned = passed && card.state === 'unlearned';
        patchState(store, {
          sm2: { ...store.sm2(), [card.id]: next },
          session: {
            ...s,
            index: s.index + 1,
            revealed: false,
            reviewed: s.reviewed + 1,
            correct: s.correct + (passed ? 1 : 0),
            learned: s.learned + (learned ? 1 : 0),
          },
        });
        return { learned, interval: next.interval };
      },
      end(): void {
        patchState(store, { session: null });
      },
    };
  }),
);
