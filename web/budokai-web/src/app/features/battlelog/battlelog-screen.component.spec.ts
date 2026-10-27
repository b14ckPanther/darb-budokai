import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { BattleLogStore } from '../../data/battlelog.store';
import { GAME_DATA } from '../../data/game-data';
import { DEMO_SEED } from '../../demo/seed.generated';
import { BattleLogScreenComponent } from './battlelog-screen.component';

const B = COPY.battlelog;
const today = DEMO_SEED.replays.days[0];

async function render(date?: string) {
  await TestBed.configureTestingModule({
    imports: [BattleLogScreenComponent],
    providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_SEED }],
  }).compileComponents();
  const f = TestBed.createComponent(BattleLogScreenComponent);
  if (date) f.componentRef.setInput('date', date);
  f.detectChanges();
  return f;
}

function key(k: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('Battle Log screen', () => {
  it('captions the current encounter with the real event and the game reading', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    const cap = el.querySelector('.caption') as HTMLElement;
    expect(cap.textContent).toContain(today.encounters[0].event);
    expect(cap.textContent).toContain(today.encounters[0].reading);
    expect(cap.getAttribute('aria-live')).toBe('polite');
  });

  it('plays and pauses with Space and moves with the arrow keys', async () => {
    const f = await render();
    const store = TestBed.inject(BattleLogStore);
    key(' ');
    expect(store.player().playing).toBe(true);
    key(' ');
    expect(store.player().playing).toBe(false);
    key('ArrowRight');
    f.detectChanges();
    expect(store.player().index).toBe(1);
    expect((f.nativeElement as HTMLElement).querySelector('.caption')!.textContent).toContain(
      today.encounters[1].reading,
    );
    key('ArrowLeft');
    expect(store.player().index).toBe(0);
  });

  it('lists every line in the full log with its source event and rule', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    for (const e of today.encounters) {
      expect(el.textContent).toContain(
        format(B.source, { eventId: e.source.eventId, ruleId: e.source.ruleId }),
      );
    }
  });

  it('ends on the day in sum', async () => {
    const f = await render();
    TestBed.inject(BattleLogStore).dispatch({ type: 'summary' });
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain(B['end-title']);
    expect(el.textContent).toContain(format(B['end-xp'], { value: today.summary.xp }));
  });

  it('shows an empty day honestly', async () => {
    const f = await render('2026-10-12');
    expect((f.nativeElement as HTMLElement).textContent).toContain(B.quiet);
  });
});
