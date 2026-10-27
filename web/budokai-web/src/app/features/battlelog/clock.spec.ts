import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BattleLogStore } from '../../data/battlelog.store';
import { DEMO_DATA, GAME_DATA } from '../../data/game-data';
import { BattleLogScreenComponent } from './battlelog-screen.component';

describe('Battle Log clock', () => {
  it('advances through the day while playing (the frame loop is not restarted by every tick)', async () => {
    let now = 0;
    let seq = 0;
    const queue: { id: number; cb: FrameRequestCallback }[] = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      queue.push({ id: ++seq, cb });
      return seq;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      const i = queue.findIndex((q) => q.id === id);
      if (i >= 0) queue.splice(i, 1);
    });
    await TestBed.configureTestingModule({
      imports: [BattleLogScreenComponent],
      providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_DATA }],
    }).compileComponents();
    const f = TestBed.createComponent(BattleLogScreenComponent);
    f.autoDetectChanges();
    const store = TestBed.inject(BattleLogStore);
    store.dispatch({ type: 'play' });
    TestBed.flushEffects();
    for (let i = 0; i < 400 && store.player().index === 0; i++) {
      TestBed.flushEffects();
      const next = queue.shift();
      if (!next) continue;
      now += 50;
      next.cb(now);
      f.detectChanges();
    }
    expect(store.player().index).toBe(1);
    expect((f.nativeElement as HTMLElement).querySelector('.caption')!.textContent).toContain(
      DEMO_DATA.replays.days[0].encounters[1].reading,
    );
    jest.restoreAllMocks();
  });
});
