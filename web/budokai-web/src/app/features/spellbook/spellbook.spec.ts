import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { DEMO_SEED } from '../../demo/seed.generated';
import { GAME_DATA } from '../../data/game-data';
import { SpellbookStore } from '../../data/spellbook.store';
import { ToastService } from '../../ui/toast.service';
import { ReviewScreenComponent } from './review-screen.component';
import { SpellbookScreenComponent } from './spellbook-screen.component';

const S = COPY.spellbook;

async function mount<T>(type: new (...a: never[]) => T, inputs: Record<string, unknown> = {}) {
  await TestBed.configureTestingModule({
    imports: [type],
    providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_SEED }],
  }).compileComponents();
  const f = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) f.componentRef.setInput(k, v);
  f.detectChanges();
  return f;
}

function key(k: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('Spellbook shelf', () => {
  it('shows each school as a tome with due, mastered and fading counts', async () => {
    const el = (await mount(SpellbookScreenComponent)).nativeElement as HTMLElement;
    for (const s of TestBed.inject(SpellbookStore).schools()) {
      expect(el.textContent).toContain(s.school);
      expect(el.textContent).toContain(format(S.due, { count: s.due }));
      expect(el.textContent).toContain(format(S.mastered, { count: s.mastered }));
    }
  });
});

describe('Review session', () => {
  const deck = 'spring-security';

  it('reveals with Space, previews intervals per grade, grades with keys 1 to 4', async () => {
    const f = await mount(ReviewScreenComponent, { deck });
    const el = f.nativeElement as HTMLElement;
    const store = TestBed.inject(SpellbookStore);
    const first = store.current()!;
    expect(el.textContent).toContain(first.q);
    expect(el.textContent).not.toContain(first.a);
    key(' ');
    f.detectChanges();
    expect(el.textContent).toContain(first.a);
    for (const g of Object.values(S.grades)) expect(el.textContent).toContain(g);
    expect(el.querySelectorAll('.grade .next')).toHaveLength(4);
    key('3');
    f.detectChanges();
    expect(store.session()!.index).toBe(1);
  });

  it('announces a learned spell when an unlearned card passes', async () => {
    const f = await mount(ReviewScreenComponent, { deck });
    const store = TestBed.inject(SpellbookStore);
    const toasts = TestBed.inject(ToastService);
    while (store.current() && store.current()!.state !== 'unlearned') {
      store.reveal();
      store.grade('good');
    }
    key(' ');
    key('3');
    f.detectChanges();
    expect(
      toasts.toasts().some((t) => t.message.startsWith(S['spell-learned'].split(':')[0])),
    ).toBe(true);
  });

  it('ends with a summary of the session', async () => {
    const f = await mount(ReviewScreenComponent, { deck });
    const store = TestBed.inject(SpellbookStore);
    while (store.current()) {
      store.reveal();
      store.grade('good');
    }
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain(S['session-done']);
  });
});
