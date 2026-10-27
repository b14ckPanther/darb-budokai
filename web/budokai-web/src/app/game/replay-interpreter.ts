/**
 * Battle-log player as a pure reducer: the UI dispatches actions and renders the state. No clocks,
 * no DOM, so stepping, seeking, speed, the end and the empty day are all unit tested.
 */
export interface ReplayEncounter {
  id: string;
  durationMs: number;
}

export interface ReplayScript {
  encounters: readonly ReplayEncounter[];
}

export interface PlayerState {
  index: number;
  t: number;
  playing: boolean;
  speed: number;
  phase: 'encounter' | 'summary' | 'quiet';
}

export type PlayerAction =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'toggle' }
  | { type: 'tick'; dt: number }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'seek'; index: number }
  | { type: 'seekMs'; ms: number }
  | { type: 'speed'; speed: number }
  | { type: 'summary' };

export function initialState(s: ReplayScript): PlayerState {
  return {
    index: 0,
    t: 0,
    playing: false,
    speed: 1,
    phase: s.encounters.length ? 'encounter' : 'quiet',
  };
}

export function timeline(s: ReplayScript): { starts: number[]; totalMs: number } {
  const starts: number[] = [];
  let acc = 0;
  for (const e of s.encounters) {
    starts.push(acc);
    acc += e.durationMs;
  }
  return { starts, totalMs: acc };
}

export function positionMs(s: ReplayScript, st: PlayerState): number {
  if (st.phase === 'summary') return timeline(s).totalMs;
  return (timeline(s).starts[st.index] ?? 0) + st.t;
}

export function reduce(s: ReplayScript, st: PlayerState, a: PlayerAction): PlayerState {
  const n = s.encounters.length;
  if (n === 0)
    return {
      ...st,
      phase: 'quiet',
      playing: false,
      speed: a.type === 'speed' ? a.speed : st.speed,
    };
  const last = n - 1;
  switch (a.type) {
    case 'play':
      return st.phase === 'summary'
        ? { ...st, phase: 'encounter', index: 0, t: 0, playing: true }
        : { ...st, playing: true };
    case 'pause':
      return { ...st, playing: false };
    case 'toggle':
      return reduce(s, st, { type: st.playing ? 'pause' : 'play' });
    case 'speed':
      return { ...st, speed: a.speed };
    case 'summary':
      return { ...st, phase: 'summary', index: last, t: 0, playing: false };
    case 'next':
      return st.index >= last || st.phase === 'summary'
        ? reduce(s, st, { type: 'summary' })
        : { ...st, index: st.index + 1, t: 0 };
    case 'prev':
      return st.phase === 'summary'
        ? { ...st, phase: 'encounter', index: last, t: 0 }
        : { ...st, index: Math.max(0, st.index - 1), t: 0 };
    case 'seek':
      return { ...st, phase: 'encounter', index: Math.min(last, Math.max(0, a.index)), t: 0 };
    case 'seekMs': {
      const { starts, totalMs } = timeline(s);
      if (a.ms >= totalMs) return reduce(s, st, { type: 'summary' });
      let i = 0;
      while (i < last && starts[i + 1] <= a.ms) i++;
      return { ...st, phase: 'encounter', index: i, t: Math.max(0, a.ms - starts[i]) };
    }
    case 'tick': {
      if (!st.playing || st.phase !== 'encounter') return st;
      let t = st.t + a.dt * st.speed;
      let index = st.index;
      while (t >= s.encounters[index].durationMs) {
        t -= s.encounters[index].durationMs;
        index++;
        if (index > last) return { ...st, phase: 'summary', index: last, t: 0, playing: false };
      }
      return { ...st, index, t };
    }
  }
}
