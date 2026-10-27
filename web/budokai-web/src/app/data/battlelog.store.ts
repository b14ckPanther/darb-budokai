import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  PlayerAction,
  initialState,
  positionMs,
  reduce,
  timeline,
} from '../game/replay-interpreter';
import { requireData } from './game-data';

/** Battle log: one compiled day at a time, played by the pure replay reducer. */
export const BattleLogStore = signalStore(
  { providedIn: 'root' },
  withState(() => {
    const d = requireData();
    const day = d.replays.days.find((r) => r.date === d.persona.today) ?? d.replays.days[0];
    return { date: day.date as string, player: initialState(day) };
  }),
  withComputed((store) => {
    const d = requireData();
    const day = computed(
      () => d.replays.days.find((r) => (r.date as string) === store.date()) ?? null,
    );
    return {
      days: computed(() =>
        [...d.replays.days]
          .map((r) => r.date)
          .sort()
          .reverse(),
      ),
      day,
      encounter: computed(() => {
        const s = day();
        const p = store.player();
        return s && p.phase === 'encounter' ? s.encounters[p.index] : null;
      }),
      timeline: computed(() => (day() ? timeline(day()!) : { starts: [], totalMs: 0 })),
      position: computed(() => (day() ? positionMs(day()!, store.player()) : 0)),
    };
  }),
  withMethods((store) => {
    const d = requireData();
    return {
      dispatch(action: PlayerAction): void {
        const s = store.day();
        if (s) patchState(store, { player: reduce(s, store.player(), action) });
      },
      select(date: string): void {
        const s = d.replays.days.find((r) => (r.date as string) === date);
        if (s)
          patchState(store, { date, player: { ...initialState(s), speed: store.player().speed } });
      },
    };
  }),
);
