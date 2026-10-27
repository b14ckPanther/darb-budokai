/**
 * Demo projection of region light and fog from the activity timeline (Phase 3 prototype). In the
 * live game quest-service emits region.fog.changed; the numbers come from the rulebook either way.
 */
import { daysBetween } from './sm2';

export interface MapRules {
  lightWindowDays: number;
  lightDecay: number;
  lightFullAt: number;
  fogPerMissedDay: number;
  fogLiftPerActiveDay: number;
  fogMax: number;
}

export interface TimelineDay {
  date: string;
  activity: Partial<Record<string, number>>;
  missed: readonly string[];
}

/** Recent activity, decayed by age within the window, scaled so lightFullAt events = 1. */
export function regionLight(
  days: readonly TimelineDay[],
  region: string,
  r: MapRules,
  today: string,
): number {
  let sum = 0;
  for (const d of days) {
    const age = daysBetween(d.date, today);
    if (age < 0 || age >= r.lightWindowDays) continue;
    sum += (d.activity[region] ?? 0) * Math.pow(r.lightDecay, age);
  }
  return Math.min(1, sum / r.lightFullAt);
}

/** Walks the days in order: a miss adds fog, an active day without a miss lifts some. */
export function regionFog(days: readonly TimelineDay[], region: string, r: MapRules): number {
  let fog = 0;
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    if (d.missed.includes(region)) fog += r.fogPerMissedDay;
    else if ((d.activity[region] ?? 0) > 0) fog -= r.fogLiftPerActiveDay;
    fog = Math.min(r.fogMax, Math.max(0, fog));
  }
  return Math.round(fog * 1e6) / 1e6;
}
