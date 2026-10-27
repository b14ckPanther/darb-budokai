import { TestBed } from '@angular/core/testing';
import { MotionService } from './motion.service';

function mockMatchMedia(reduced: boolean) {
  const listeners: ((e: { matches: boolean }) => void)[] = [];
  const mql = {
    matches: reduced,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
    removeEventListener: () => undefined,
  };
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => mql });
  return (next: boolean) => {
    mql.matches = next;
    listeners.forEach((fn) => fn({ matches: next }));
  };
}

describe('MotionService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-motion');
  });

  function create() {
    TestBed.resetTestingModule();
    const svc = TestBed.inject(MotionService);
    TestBed.flushEffects();
    return svc;
  }

  it('follows the OS setting by default', () => {
    const setOs = mockMatchMedia(false);
    const svc = create();
    expect(svc.reduced()).toBe(false);
    expect(document.documentElement.dataset['motion']).toBe('full');
    setOs(true);
    TestBed.flushEffects();
    expect(svc.reduced()).toBe(true);
    expect(document.documentElement.dataset['motion']).toBe('reduced');
  });

  it('in-app override wins over the OS and sets data-motion on <html>', () => {
    mockMatchMedia(false);
    const svc = create();
    svc.setPreference('reduced');
    TestBed.flushEffects();
    expect(document.documentElement.dataset['motion']).toBe('reduced');
    svc.setPreference('full');
    TestBed.flushEffects();
    expect(document.documentElement.dataset['motion']).toBe('full');
  });

  it('remembers the override and survives broken storage', () => {
    mockMatchMedia(false);
    create().setPreference('reduced');
    expect(create().preference()).toBe('reduced');
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(create().preference()).toBe('system');
    spy.mockRestore();
  });
});
