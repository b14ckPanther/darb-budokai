import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { COPY } from './copy/copy.generated';
import { DEMO_MODE } from './data/game-data';

async function render(demo: boolean) {
  await TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [provideRouter([]), { provide: DEMO_MODE, useValue: demo }],
  }).compileComponents();
  const f = TestBed.createComponent(AppComponent);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('AppComponent shell', () => {
  it('shows the demo banner, the navigation and the routed screen in demo mode', async () => {
    const el = await render(true);
    expect(el.querySelector('[role=note]')?.textContent).toContain(COPY.shell['demo-banner']);
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe(COPY.shell['nav-label']);
    expect(el.querySelector('main router-outlet')).not.toBeNull();
    expect(el.querySelector('bk-toast-host [role=status]')).not.toBeNull();
  });

  it('has no banner and an honest empty state without a data source', async () => {
    const el = await render(false);
    expect(el.querySelector('[role=note]')).toBeNull();
    expect(el.querySelector('nav')).toBeNull();
    expect(el.querySelector('h1')?.textContent).toBe(COPY.shell['no-data-title']);
  });

  it('sets the motion attribute', async () => {
    await render(true);
    expect(document.documentElement.dataset['motion']).toMatch(/^(full|reduced)$/);
  });
});
