import { RenderScheduler } from './render-scheduler';

/** A fake frame clock: frames run only when the test says so. */
function fakeClock() {
  let queue: ((t: number) => void)[] = [];
  let now = 0;
  return {
    raf: (cb: (t: number) => void) => {
      queue.push(cb);
      return queue.length;
    },
    cancel: () => {
      queue = [];
    },
    pending: () => queue.length,
    tick(ms = 16) {
      now += ms;
      const run = queue;
      queue = [];
      run.forEach((cb) => cb(now));
    },
  };
}

describe('RenderScheduler (render on demand)', () => {
  it('draws nothing until asked, then exactly one frame', () => {
    const clock = fakeClock();
    const render = jest.fn(() => false);
    const s = new RenderScheduler(clock.raf, clock.cancel, render);
    clock.tick();
    expect(render).not.toHaveBeenCalled();
    s.requestRender();
    s.requestRender();
    expect(clock.pending()).toBe(1);
    clock.tick();
    expect(render).toHaveBeenCalledTimes(1);
    clock.tick();
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('keeps drawing while the scene says it is animating, then stops', () => {
    const clock = fakeClock();
    let frames = 3;
    const render = jest.fn(() => --frames > 0);
    const s = new RenderScheduler(clock.raf, clock.cancel, render);
    s.requestRender();
    for (let i = 0; i < 6; i++) clock.tick();
    expect(render).toHaveBeenCalledTimes(3);
  });

  it('passes elapsed time and stops after dispose', () => {
    const clock = fakeClock();
    const times: number[] = [];
    const s = new RenderScheduler(clock.raf, clock.cancel, (t) => {
      times.push(t);
      return true;
    });
    s.requestRender();
    clock.tick(10);
    clock.tick(20);
    expect(times).toEqual([10, 30]);
    s.dispose();
    clock.tick();
    s.requestRender();
    clock.tick();
    expect(times).toHaveLength(2);
  });
});
