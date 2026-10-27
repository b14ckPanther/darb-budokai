import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { DEMO_DATA as DEMO_SEED } from '../../data/game-data';
import { GAME_DATA } from '../../data/game-data';
import { QuestStore } from '../../data/quest.store';
import { ToastService } from '../../ui/toast.service';
import { QuestsScreenComponent } from './quests-screen.component';

const Q = COPY.quests;

async function render() {
  await TestBed.configureTestingModule({
    imports: [QuestsScreenComponent],
    providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_SEED }],
  }).compileComponents();
  const f = TestBed.createComponent(QuestsScreenComponent);
  f.autoDetectChanges();
  await f.whenStable();
  return f;
}

function tab(el: HTMLElement, name: string) {
  (
    Array.from(el.querySelectorAll('[role=radio]')).find(
      (r) => r.textContent?.trim() === name,
    ) as HTMLElement
  ).click();
}

describe('Quest Log', () => {
  it('has the five tabs and opens on Today with active habits as swipe rows', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    const tabs = Array.from(el.querySelectorAll('[role=radio]')).map((r) => r.textContent?.trim());
    expect(tabs).toEqual([
      Q.tabs.today,
      Q.tabs.main,
      Q.tabs.raids,
      Q.tabs.proposed,
      Q.tabs.history,
    ]);
    const active = DEMO_SEED.quests.habits.filter((h) => h.status === 'active');
    expect(el.querySelectorAll('bk-swipe-row')).toHaveLength(active.length);
  });

  it('checks in from a row action and announces it', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const toasts = TestBed.inject(ToastService);
    const row = Array.from(el.querySelectorAll('bk-swipe-row')).find((r) =>
      r.textContent?.includes('Walk outside'),
    )!;
    (
      Array.from(row.querySelectorAll('.actions button')).find((b) =>
        b.textContent?.includes(Q['check-in']),
      ) as HTMLElement
    ).click();
    // Read the toast before waiting: whenStable also waits out its auto-dismiss timer.
    expect(toasts.toasts().at(-1)?.message).toContain('Walk outside');
    expect(
      TestBed.inject(QuestStore)
        .habits()
        .find((h) => h.id === 'h3')!.progress,
    ).toBe(1);
  });

  it('shows main quests by stage, with the fallen quest explained kindly', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    tab(el, Q.tabs.main);
    await f.whenStable();
    for (const m of DEMO_SEED.quests.main) expect(el.textContent).toContain(m.company);
    expect(el.textContent).toContain(Q.stages.rejected);
    expect(el.textContent).toContain(Q['fallen-note']);
  });

  it('creates a habit in the editor sheet and refuses an empty name', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    (
      Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(Q['new-habit']),
      ) as HTMLElement
    ).click();
    await f.whenStable();
    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await f.whenStable();
    expect(el.textContent).toContain(Q['habit-form']['error-title']);
    const input = form.querySelector('input[name=title]') as HTMLInputElement;
    input.value = 'Drink water';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    expect(
      TestBed.inject(QuestStore)
        .habits()
        .some((h) => h.title === 'Drink water'),
    ).toBe(true);
  });

  it('lists proposals with accept and dismiss, and notes they award nothing', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    tab(el, Q.tabs.proposed);
    await f.whenStable();
    expect(el.textContent).toContain(Q['proposed-note']);
    expect(el.textContent).toContain(DEMO_SEED.quests.proposed[0].title);
  });
});
