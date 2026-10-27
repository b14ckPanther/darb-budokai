import { InjectionToken, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { DEMO_SEED } from '../demo/seed.generated';

/**
 * The shape every data source must provide. It mirrors the JSON Schemas in contracts/seed/demo
 * (seed-data.spec.ts validates the demo files against them). Until the GraphQL link arrives in
 * Phase 6 only the demo seed provides it.
 */
export type StatId = 'vigor' | 'craft' | 'lore' | 'resolve';
export type RegionId = 'springs' | 'forge' | 'archive' | 'citadel-road' | 'wilds';
export type Evidence = 'verified' | 'attested' | 'self_reported' | 'simulated';
export type RarityId = 'common' | 'rare' | 'epic' | 'legendary';
export type Stage =
  | 'saved'
  | 'applied'
  | 'hr_call'
  | 'tech_interview'
  | 'home_task'
  | 'final_interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';
export type ObjectiveId = 'checkin' | 'count' | 'duration' | 'event';

export interface Encounter {
  id: string;
  at: string;
  region: string;
  kind: string;
  event: string;
  reading: string;
  deltas: { kind: string; stat?: StatId; amount: number; label?: string }[];
  loot?: { itemId: string; name: string; rarity: RarityId }[];
  durationMs: number;
  source: { eventId: string; ruleId: string; evidence: Evidence };
}

export interface ReplayDay {
  version: number;
  date: string;
  rulebookVersion: string;
  encounters: Encounter[];
  summary: {
    xp: number;
    stamina: number;
    spellsLearned: number;
    fogChanges: { region: string; delta: number }[];
    tomorrow: { dueCards: number; quests: number };
  };
}

export interface GameData {
  persona: {
    today: string;
    timezone: string;
    character: {
      name: string;
      title: string;
      level: number;
      xp: number;
      xpLevelStart: number;
      xpNext: number;
      stamina: number;
      staminaMax: number;
      status: 'normal' | 'exhausted';
    };
    stats: {
      id: StatId;
      rank: number;
      xp: number;
      xpNext: number;
      week: { source: string; amount: number; replay?: string }[];
    }[];
    equipment: { slot: string; itemId: string | null }[];
    inventory: {
      id: string;
      name: string;
      rarity: RarityId;
      modifier: string;
      from: string;
      date: string;
    }[];
    titles: { id: string; name: string; earned: string; reason: string }[];
    deeds: { id: string; name: string; earned: string }[];
  };
  map: {
    regions: {
      id: RegionId;
      stat: StatId | null;
      centre: number[];
      radius: number;
      tint: string;
      locked?: boolean;
    }[];
    markers: {
      id: string;
      kind: 'main-quest' | 'raid' | 'boss' | 'portal';
      region: RegionId;
      at: number[];
      ref: string;
    }[];
  };
  timeline: {
    days: { date: string; activity: Partial<Record<RegionId, number>>; missed: RegionId[] }[];
  };
  quests: {
    habits: {
      id: string;
      title: string;
      region: RegionId;
      objective: ObjectiveId;
      target: number;
      unit?: string;
      evidence: Evidence;
      streak: number;
      status: 'active' | 'paused' | 'archived';
      progress: number;
    }[];
    main: {
      id: string;
      company: string;
      role: string;
      stage: Stage;
      appliedOn: string;
      next: string;
      history: { stage: Stage; date: string }[];
    }[];
    raids: { id: string; quest: string; stage: Stage; status: 'open' | 'cleared'; date: string }[];
    bosses: {
      id: string;
      title: string;
      review: string;
      tier: 'minor' | 'major' | 'critical';
      maxHp: number;
      hp: number;
      status: 'engaged' | 'defeated';
      findings: {
        id: string;
        severity: 'critical' | 'major' | 'minor' | 'nit';
        tag: string;
        resolved: boolean;
      }[];
    }[];
    proposed: {
      id: string;
      title: string;
      region: RegionId;
      objective: ObjectiveId;
      target: number;
      day: string;
    }[];
    history: { date: string; completed: number; failed: number }[];
  };
  decks: {
    decks: {
      id: string;
      name: string;
      school: string;
      cards: {
        id: string;
        q: string;
        a: string;
        tags: string[];
        sm2: { reps: number; interval: number; ef: number; due: string };
      }[];
    }[];
  };
  'skill-tree': {
    nodes: {
      id: string;
      stat: StatId;
      at: number[];
      requires: string[];
      state: 'locked' | 'available' | 'unlocked';
      progress: number[];
    }[];
  };
  replays: { days: ReplayDay[] };
  rulebook: {
    version: string;
    sm2: {
      initialEasiness: number;
      minEasiness: number;
      firstIntervalDays: number;
      secondIntervalDays: number;
      passGrade: number;
      grades: { again: number; hard: number; good: number; easy: number };
    };
    spells: { masteryIntervalDays: number; fadeAfterDays: number };
    map: {
      lightWindowDays: number;
      lightDecay: number;
      lightFullAt: number;
      fogPerMissedDay: number;
      fogLiftPerActiveDay: number;
      fogMax: number;
    };
    tables: { id: string; columns: string[]; rows: string[][] }[];
  };
  integrations: {
    producers: {
      id: string;
      name: string;
      kind: 'core' | 'cosmetic';
      keyId: string | null;
      scopes: string[];
      status: 'connected' | 'idle' | 'off';
      lastEvent: string | null;
      accepted7d: number;
      rejected: { at: string; type: string; reason: string }[];
    }[];
  };
}

/** The demo seed, read as GameData. Its shape is checked against the schemas in seed-data.spec.ts. */
export const DEMO_DATA = DEMO_SEED as unknown as GameData;

export const DEMO_MODE = new InjectionToken<boolean>('DEMO_MODE', {
  providedIn: 'root',
  factory: () => environment.demo,
});

/** Demo builds read config/seed/demo; other builds have no data source yet and show an honest empty state. */
export const GAME_DATA = new InjectionToken<GameData | null>('GAME_DATA', {
  providedIn: 'root',
  factory: () => (inject(DEMO_MODE) ? DEMO_DATA : null),
});

/** For stores, which only exist on routes the shell renders when data is present. */
export function requireData(): GameData {
  const d = inject(GAME_DATA);
  if (!d) throw new Error('No game data source: stores need demo mode or the backend.');
  return d;
}
