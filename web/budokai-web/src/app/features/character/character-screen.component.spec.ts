import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { DEMO_SEED } from '../../demo/seed.generated';
import { GAME_DATA } from '../../data/game-data';
import { CharacterScreenComponent } from './character-screen.component';

describe('Character Sheet', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [CharacterScreenComponent],
      providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_SEED }],
    }).compileComponents();
    const f = TestBed.createComponent(CharacterScreenComponent);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('renders the character, stats and stamina from the store', async () => {
    const el = await render();
    const c = DEMO_SEED.persona.character;
    expect(el.textContent).toContain(c.name);
    expect(el.textContent).toContain(`Level ${c.level}`);
    expect(el.textContent).toContain(`${c.stamina} of ${c.staminaMax}`);
    for (const s of DEMO_SEED.persona.stats)
      expect(el.textContent).toContain(COPY.stats[s.id].name);
    expect(el.querySelectorAll('bk-stat-dial')).toHaveLength(4);
  });

  it('gives every number a text label (no bare numbers in meters and dials)', async () => {
    const el = await render();
    for (const bar of Array.from(el.querySelectorAll('[role=progressbar]'))) {
      expect(bar.getAttribute('aria-label')?.length).toBeGreaterThan(0);
      expect(bar.getAttribute('aria-valuetext') ?? bar.getAttribute('aria-label')).toBeTruthy();
    }
    for (const amt of Array.from(el.querySelectorAll('.week li'))) {
      expect(amt.querySelector('.src')?.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('shows each item with its exact modifier and the event that dropped it', async () => {
    const el = await render();
    for (const i of DEMO_SEED.persona.inventory) {
      expect(el.textContent).toContain(i.modifier);
      expect(el.textContent).toContain(i.from);
    }
  });
});
