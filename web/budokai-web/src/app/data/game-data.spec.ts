import { TestBed } from '@angular/core/testing';
import { DEMO_DATA as DEMO_SEED, DEMO_MODE, GAME_DATA } from './game-data';

describe('game data source', () => {
  it('serves the demo seed when the build is in demo mode', () => {
    TestBed.configureTestingModule({ providers: [{ provide: DEMO_MODE, useValue: true }] });
    expect(TestBed.inject(GAME_DATA)).toBe(DEMO_SEED);
  });

  it('serves nothing outside demo mode until the backend exists', () => {
    TestBed.configureTestingModule({ providers: [{ provide: DEMO_MODE, useValue: false }] });
    expect(TestBed.inject(GAME_DATA)).toBeNull();
  });
});
