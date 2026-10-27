import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { COPY } from '../copy/copy.generated';
import { requireData } from './game-data';

type Slot = keyof typeof COPY.character.slots;

export const CharacterStore = signalStore(
  { providedIn: 'root' },
  withState(() => {
    const d = requireData();
    return {
      equipped: Object.fromEntries(d.persona.equipment.map((e) => [e.slot, e.itemId])) as Record<
        string,
        string | null
      >,
    };
  }),
  withComputed((store) => {
    const d = requireData();
    const p = d.persona;
    return {
      character: computed(() => p.character),
      today: computed(() => p.today),
      stats: computed(() =>
        p.stats.map((s) => ({
          ...s,
          name: COPY.stats[s.id].name,
          meaning: COPY.stats[s.id].meaning,
          progress: s.xp / s.xpNext,
        })),
      ),
      inventory: computed(() => p.inventory),
      equipment: computed(() =>
        (Object.keys(COPY.character.slots) as Slot[]).map((slot) => ({
          slot,
          label: COPY.character.slots[slot],
          item: p.inventory.find((i) => i.id === store.equipped()[slot]) ?? null,
        })),
      ),
      titles: computed(() => p.titles),
      deeds: computed(() => p.deeds),
    };
  }),
  withMethods((store) => ({
    equip(slot: string, itemId: string | null): void {
      patchState(store, { equipped: { ...store.equipped(), [slot]: itemId } });
    },
  })),
);
