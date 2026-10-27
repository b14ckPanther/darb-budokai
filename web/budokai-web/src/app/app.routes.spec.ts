import { routes } from './app.routes';

describe('routes', () => {
  it('serves the /design style page in development builds only', () => {
    // Jest compiles src/environments/environment.ts, the production file.
    expect(routes.map((r) => r.path)).not.toContain('design');
  });

  it('sends unknown paths home', () => {
    expect(routes.at(-1)).toEqual({ path: '**', redirectTo: '' });
  });
});
