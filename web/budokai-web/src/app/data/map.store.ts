import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { COPY } from '../copy/copy.generated';
import { format } from '../copy/format';
import { TOKENS } from '../design/tokens.generated';
import { regionFog, regionLight } from '../game/map-rules';
import { requireData } from './game-data';

type RegionId = keyof typeof COPY.regions;
type MarkerKind = keyof typeof COPY.map.markers;

/** World map state: each region's light and dust from the timeline, plus named markers. */
export const MapStore = signalStore(
  { providedIn: 'root' },
  withState({ selected: null as string | null }),
  withComputed((store) => {
    const d = requireData();
    const today = d.persona.today;
    const replayToday = d.replays.days.find((r) => r.date === today);
    const tints = TOKENS.themes.dark as Record<string, string>;
    const regions = computed(() =>
      d.map.regions.map((r) => {
        const copy = COPY.regions[r.id as RegionId];
        return {
          id: r.id,
          name: copy.name,
          about: copy.about,
          stat: r.stat,
          centre: r.centre,
          radius: r.radius,
          tint: tints[r.tint],
          locked: 'locked' in r && !!r.locked,
          light: regionLight(d.timeline.days, r.id, d.rulebook.map, today),
          fog: regionFog(d.timeline.days, r.id, d.rulebook.map),
          encounters: (replayToday?.encounters ?? []).filter((e) => e.region === r.id),
          habits: d.quests.habits.filter((h) => h.region === r.id && h.status === 'active'),
        };
      }),
    );
    const stage = (s: string) => COPY.quests.stages[s as keyof typeof COPY.quests.stages];
    const detail = (kind: MarkerKind, ref: string): string => {
      const t = COPY.map['marker-detail'][kind];
      if (kind === 'main-quest') {
        const q = d.quests.main.find((m) => m.id === ref)!;
        return format(t, { company: q.company, stage: stage(q.stage) });
      }
      if (kind === 'raid') {
        const r = d.quests.raids.find((x) => x.id === ref)!;
        const company = d.quests.main.find((m) => m.id === r.quest)?.company ?? '';
        return format(t, { company, status: COPY.quests['raid-status'][r.status] });
      }
      if (kind === 'boss') {
        const b = d.quests.bosses.find((x) => x.id === ref)!;
        return format(t, { title: b.title, status: COPY.quests['boss-status'][b.status] });
      }
      return t;
    };
    const markers = computed(() =>
      d.map.markers.map((m) => ({
        ...m,
        kindLabel: COPY.map.markers[m.kind as MarkerKind],
        label: detail(m.kind as MarkerKind, m.ref),
        regionName: COPY.regions[m.region as RegionId].name,
      })),
    );
    return {
      regions,
      markers,
      selectedRegion: computed(() => regions().find((r) => r.id === store.selected()) ?? null),
      selectedMarker: computed(() => markers().find((m) => m.id === store.selected()) ?? null),
      summary: computed(() =>
        regions()
          .map((r) =>
            format(COPY.map['summary-region'], {
              name: r.name,
              light: Math.round(r.light * 100),
              fog: Math.round(r.fog * 100),
            }),
          )
          .join('. '),
      ),
    };
  }),
  withMethods((store) => ({
    select(id: string | null): void {
      patchState(store, { selected: id });
    },
  })),
);
