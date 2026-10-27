import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { GAME_DATA } from '../../data/game-data';
import { DEMO_SEED } from '../../demo/seed.generated';
import { IntegrationsScreenComponent } from '../integrations/integrations-screen.component';
import { RulebookScreenComponent } from './rulebook-screen.component';

async function render<T>(type: new (...a: never[]) => T) {
  await TestBed.configureTestingModule({
    imports: [type],
    providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_SEED }],
  }).compileComponents();
  const f = TestBed.createComponent(type);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('Rulebook', () => {
  it('renders every rule table with a caption and column headers', async () => {
    const el = await render(RulebookScreenComponent);
    const tables = el.querySelectorAll('table');
    expect(tables).toHaveLength(DEMO_SEED.rulebook.tables.length);
    for (const t of DEMO_SEED.rulebook.tables) {
      expect(el.textContent).toContain(
        COPY.rulebook.tables[t.id as keyof typeof COPY.rulebook.tables],
      );
    }
    expect(tables[0].querySelectorAll('th[scope=col]').length).toBe(
      DEMO_SEED.rulebook.tables[0].columns.length,
    );
    expect(el.textContent).toContain(DEMO_SEED.rulebook.version);
  });
});

describe('Integrations', () => {
  it('shows each producer with its kind, scopes and rejected events, and marks cosmetic apps', async () => {
    const el = await render(IntegrationsScreenComponent);
    for (const p of DEMO_SEED.integrations.producers) {
      expect(el.textContent).toContain(p.name);
      for (const s of p.scopes) expect(el.textContent).toContain(s);
    }
    expect(el.textContent).toContain(COPY.integrations.kinds.cosmetic);
    expect(el.textContent).toContain('Dated in the future');
  });

  it('never shows a key secret, only key ids', async () => {
    const el = await render(IntegrationsScreenComponent);
    expect(el.textContent).not.toMatch(/secret|hmac/i);
  });
});
