import { ReplayScript, initialState, reduce, timeline } from './replay-interpreter';

const enc = (id: string, ms: number) => ({ id, durationMs: ms });
const script = {
  encounters: [enc('a', 1000), enc('b', 2000), enc('c', 1000)],
} as unknown as ReplayScript;
const quiet = { encounters: [] } as unknown as ReplayScript;

describe('replay interpreter', () => {
  it('starts paused on the first encounter', () => {
    const s = initialState(script);
    expect(s).toMatchObject({ index: 0, t: 0, playing: false, phase: 'encounter', speed: 1 });
  });

  it('steps through encounters as time passes and ends on the summary', () => {
    let s = reduce(script, initialState(script), { type: 'play' });
    s = reduce(script, s, { type: 'tick', dt: 999 });
    expect(s.index).toBe(0);
    s = reduce(script, s, { type: 'tick', dt: 2 });
    expect(s).toMatchObject({ index: 1, t: 1 });
    s = reduce(script, s, { type: 'tick', dt: 2999 });
    expect(s.phase).toBe('summary');
    expect(s.playing).toBe(false);
  });

  it('applies speed to time', () => {
    let s = reduce(script, initialState(script), { type: 'speed', speed: 2 });
    s = reduce(script, reduce(script, s, { type: 'play' }), { type: 'tick', dt: 600 });
    expect(s).toMatchObject({ index: 1, t: 200 });
  });

  it('next, previous and seek move between encounters and clamp at the ends', () => {
    let s = reduce(script, initialState(script), { type: 'next' });
    expect(s.index).toBe(1);
    s = reduce(script, s, { type: 'prev' });
    s = reduce(script, s, { type: 'prev' });
    expect(s.index).toBe(0);
    s = reduce(script, s, { type: 'seek', index: 2 });
    expect(s).toMatchObject({ index: 2, t: 0 });
    s = reduce(script, s, { type: 'next' });
    expect(s.phase).toBe('summary');
    s = reduce(script, s, { type: 'prev' });
    expect(s).toMatchObject({ phase: 'encounter', index: 2 });
    s = reduce(script, s, { type: 'seekMs', ms: 1500 });
    expect(s).toMatchObject({ index: 1, t: 500 });
  });

  it('skips to the summary and restarts', () => {
    let s = reduce(script, initialState(script), { type: 'summary' });
    expect(s.phase).toBe('summary');
    s = reduce(script, s, { type: 'play' });
    expect(s).toMatchObject({ phase: 'encounter', index: 0, playing: true });
  });

  it('an empty day is quiet: nothing to play', () => {
    const s = initialState(quiet);
    expect(s.phase).toBe('quiet');
    expect(reduce(quiet, s, { type: 'play' }).playing).toBe(false);
    expect(reduce(quiet, s, { type: 'tick', dt: 1000 }).phase).toBe('quiet');
  });

  it('knows each encounter start for the scrubber ticks', () => {
    expect(timeline(script)).toEqual({ starts: [0, 1000, 3000], totalMs: 4000 });
  });
});
