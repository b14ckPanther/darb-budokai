import { TestBed } from '@angular/core/testing';
import { COPY } from '../copy/copy.generated';
import { MapLookComponent } from './map-look.component';

describe('bk-map-look', () => {
  it('falls back to a text description when WebGL is unavailable', async () => {
    await TestBed.configureTestingModule({ imports: [MapLookComponent] }).compileComponents();
    const f = TestBed.createComponent(MapLookComponent);
    f.componentRef.setInput('level', 'quiet');
    f.autoDetectChanges();
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.fallback')?.textContent).toContain(
      COPY.design.samples['level-quiet'],
    );
    expect(el.querySelector('canvas')?.hidden).toBe(true);
  });
});
