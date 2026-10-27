import { InjectionToken, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { DEMO_SEED } from '../demo/seed.generated';

/** The shape every data source must provide. Until the GraphQL link (Phase 6) only the demo seed does. */
export type GameData = typeof DEMO_SEED;

export const DEMO_MODE = new InjectionToken<boolean>('DEMO_MODE', {
  providedIn: 'root',
  factory: () => environment.demo,
});

/** Demo builds read config/seed/demo; other builds have no data source yet and show an honest empty state. */
export const GAME_DATA = new InjectionToken<GameData | null>('GAME_DATA', {
  providedIn: 'root',
  factory: () => (inject(DEMO_MODE) ? DEMO_SEED : null),
});

/** For stores, which only exist on routes the shell renders when data is present. */
export function requireData(): GameData {
  const d = inject(GAME_DATA);
  if (!d) throw new Error('No game data source: stores need demo mode or the backend.');
  return d;
}
