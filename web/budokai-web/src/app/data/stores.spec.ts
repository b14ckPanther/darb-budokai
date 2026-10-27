import { TestBed } from '@angular/core/testing';
import { DEMO_SEED } from '../demo/seed.generated';
import { regionFog, regionLight } from '../game/map-rules';
import { GAME_DATA, GameData } from './game-data';
import { CharacterStore } from './character.store';
import { MapStore } from './map.store';
import { QuestStore } from './quest.store';
import { SpellbookStore } from './spellbook.store';
import { BattleLogStore } from './battlelog.store';

function setup(data: GameData = DEMO_SEED) {
  TestBed.configureTestingModule({ providers: [{ provide: GAME_DATA, useValue: data }] });
}

describe('MapStore', () => {
  it('maps the timeline to region light and fog with the rulebook rules', () => {
    setup();
    const store = TestBed.inject(MapStore);
    const s = DEMO_SEED;
    const archive = store.regions().find((r) => r.id === 'archive')!;
    expect(archive.light).toBeCloseTo(
      regionLight(s.timeline.days, 'archive', s.rulebook.map, s.persona.today),
    );
    expect(archive.fog).toBeCloseTo(regionFog(s.timeline.days, 'archive', s.rulebook.map));
    expect(archive.fog).toBeGreaterThan(0);
    expect(store.regions().find((r) => r.id === 'springs')!.light).toBeGreaterThan(archive.light);
  });

  it('a fully neglected region is dark and foggy', () => {
    const data = JSON.parse(JSON.stringify(DEMO_SEED)) as GameData;
    for (const d of data.timeline.days) {
      (d.activity as Record<string, number>)['forge'] = 0;
      (d.missed as string[]).push('forge');
    }
    setup(data);
    const forge = TestBed.inject(MapStore)
      .regions()
      .find((r) => r.id === 'forge')!;
    expect(forge.light).toBe(0);
    expect(forge.fog).toBe(data.rulebook.map.fogMax);
  });

  it('names every marker from copy and the quest it points to', () => {
    setup();
    const markers = TestBed.inject(MapStore).markers();
    const q = markers.find((m) => m.id === 'm-q3')!;
    expect(q.label).toContain('Cobalt Reach');
    expect(markers.every((m) => m.label.length > 0 && m.kindLabel.length > 0)).toBe(true);
  });
});

describe('QuestStore', () => {
  beforeEach(() => setup());

  it('counts today and checks a habit in once', () => {
    const q = TestBed.inject(QuestStore);
    const before = q.today();
    q.checkIn('h3');
    expect(q.today().done).toBe(before.done + 1);
    q.checkIn('h3');
    expect(q.today().done).toBe(before.done + 1);
  });

  it('pauses, resumes, archives and saves habits locally', () => {
    const q = TestBed.inject(QuestStore);
    q.setStatus('h5', 'paused');
    expect(q.habits().find((h) => h.id === 'h5')!.status).toBe('paused');
    q.setStatus('h5', 'archived');
    expect(q.activeHabits().some((h) => h.id === 'h5')).toBe(false);
    const id = q.saveHabit({
      title: 'Drink water',
      region: 'springs',
      objective: 'checkin',
      target: 1,
    });
    expect(q.habits().find((h) => h.id === id)).toMatchObject({
      title: 'Drink water',
      evidence: 'self_reported',
      progress: 0,
    });
  });

  it('accepting a proposal adds a quest; dismissing removes it', () => {
    const q = TestBed.inject(QuestStore);
    const n = q.habits().length;
    q.acceptProposal('p1');
    expect(q.habits().length).toBe(n + 1);
    q.dismissProposal('p2');
    expect(q.proposed()).toHaveLength(0);
  });
});

describe('SpellbookStore', () => {
  beforeEach(() => setup());

  it('counts due, mastered and fading per school', () => {
    const s = TestBed.inject(SpellbookStore);
    const total = s.schools().reduce((n, d) => n + d.total, 0);
    expect(total).toBe(40);
    expect(s.schools().every((d) => d.due >= 0 && d.mastered >= 0 && d.fading >= 0)).toBe(true);
    expect(s.schools().some((d) => d.fading > 0)).toBe(true);
  });

  it('runs a review session: reveal, grade, next, and reports a learned spell', () => {
    const s = TestBed.inject(SpellbookStore);
    const deck = s.schools().find((d) => d.due > 0)!;
    s.start(deck.id);
    const first = s.session()!;
    expect(first.revealed).toBe(false);
    s.reveal();
    const unlearned = first.queue[0].state === 'unlearned';
    const result = s.grade('good');
    expect(result.learned).toBe(unlearned);
    expect(s.session()!.index).toBe(1);
    expect(s.session()!.revealed).toBe(false);
  });
});

describe('CharacterStore', () => {
  it('equips an item into its slot', () => {
    setup();
    const c = TestBed.inject(CharacterStore);
    c.equip('charm', 'i1');
    expect(c.equipment().find((e) => e.slot === 'charm')!.item?.id).toBe('i1');
  });
});

describe('BattleLogStore', () => {
  it('opens on the latest day and plays it', () => {
    setup();
    const b = TestBed.inject(BattleLogStore);
    expect(b.day()!.date).toBe(DEMO_SEED.persona.today);
    b.dispatch({ type: 'play' });
    expect(b.player().playing).toBe(true);
    b.select('2026-10-12');
    expect(b.player().phase).toBe('quiet');
  });
});
