import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { requireData } from './game-data';

export type HabitStatus = 'active' | 'paused' | 'archived';
export type Objective = 'checkin' | 'count' | 'duration' | 'event';

export interface Habit {
  id: string;
  title: string;
  region: string;
  objective: Objective;
  target: number;
  unit?: string;
  evidence: 'verified' | 'attested' | 'self_reported' | 'simulated';
  streak: number;
  status: HabitStatus;
  progress: number;
}

export interface HabitDraft {
  id?: string;
  title: string;
  region: string;
  objective: Objective;
  target: number;
}

/** Quest Log. In the prototype edits stay in memory (PLAN Phase 3 task 13: local only). */
export const QuestStore = signalStore(
  { providedIn: 'root' },
  withState(() => {
    const d = requireData();
    return {
      habits: d.quests.habits.map((h) => ({ ...h })) as Habit[],
      proposed: d.quests.proposed.map((p) => ({ ...p })),
      seq: 0,
    };
  }),
  withComputed((store) => {
    const d = requireData();
    const companyOf = (questId: string) =>
      d.quests.main.find((m) => m.id === questId)?.company ?? '';
    return {
      activeHabits: computed(() => store.habits().filter((h) => h.status === 'active')),
      pausedHabits: computed(() => store.habits().filter((h) => h.status === 'paused')),
      today: computed(() => {
        const a = store.habits().filter((h) => h.status === 'active');
        return { done: a.filter((h) => h.progress >= h.target).length, total: a.length };
      }),
      main: computed(() => d.quests.main),
      raids: computed(() => d.quests.raids.map((r) => ({ ...r, company: companyOf(r.quest) }))),
      bosses: computed(() => d.quests.bosses),
      history: computed(() => [...d.quests.history].reverse()),
    };
  }),
  withMethods((store) => {
    const update = (id: string, f: (h: Habit) => Habit) =>
      patchState(store, { habits: store.habits().map((h) => (h.id === id ? f(h) : h)) });
    return {
      checkIn(id: string): void {
        update(id, (h) =>
          h.progress >= h.target
            ? h
            : {
                ...h,
                progress: h.objective === 'checkin' ? h.target : h.progress + 1,
                streak: h.streak + (h.progress + 1 >= h.target ? 1 : 0),
              },
        );
      },
      setStatus(id: string, status: HabitStatus): void {
        update(id, (h) => ({ ...h, status }));
      },
      saveHabit(draft: HabitDraft): string {
        if (draft.id) {
          update(draft.id, (h) => ({ ...h, ...draft, id: h.id }));
          return draft.id;
        }
        const id = `local-${store.seq() + 1}`;
        const habit: Habit = {
          ...draft,
          id,
          evidence: 'self_reported',
          streak: 0,
          status: 'active',
          progress: 0,
        };
        patchState(store, { habits: [...store.habits(), habit], seq: store.seq() + 1 });
        return id;
      },
      acceptProposal(id: string): void {
        const p = store.proposed().find((x) => x.id === id);
        if (!p) return;
        const nid = `local-${store.seq() + 1}`;
        const habit: Habit = {
          id: nid,
          title: p.title,
          region: p.region,
          objective: p.objective as Objective,
          target: p.target,
          evidence: 'self_reported',
          streak: 0,
          status: 'active',
          progress: 0,
        };
        patchState(store, {
          habits: [...store.habits(), habit],
          proposed: store.proposed().filter((x) => x.id !== id),
          seq: store.seq() + 1,
        });
      },
      dismissProposal(id: string): void {
        patchState(store, { proposed: store.proposed().filter((x) => x.id !== id) });
      },
    };
  }),
);
