import { routes } from './app.routes';

describe('routes', () => {
  it('serves the /design style page in development builds only', () => {
    // Jest compiles src/environments/environment.ts, the production file.
    expect(routes.map((r) => r.path)).not.toContain('design');
  });

  it('has every screen of the prototype, with a title', () => {
    const paths = routes.filter((r) => r.loadComponent).map((r) => r.path);
    expect(paths).toEqual([
      'map',
      'quests',
      'spellbook',
      'spellbook/:deck',
      'character',
      'character/skills',
      'log',
      'rulebook',
      'integrations',
    ]);
    expect(
      routes
        .filter((r) => r.loadComponent)
        .every((r) => typeof r.title === 'string' && r.title.length > 0),
    ).toBe(true);
  });

  it('opens on the map and sends unknown paths there', () => {
    expect(routes[0]).toEqual({ path: '', pathMatch: 'full', redirectTo: 'map' });
    expect(routes.at(-1)).toEqual({ path: '**', redirectTo: 'map' });
  });
});
