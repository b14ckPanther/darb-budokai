import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import messages from '../locale/messages.en.json';

describe('AppComponent', () => {
  async function render() {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the product name from the locale messages as the only h1', async () => {
    const el = await render();
    const headings = el.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe(messages['app.name']);
  });

  it('renders the tagline from the locale messages', async () => {
    const el = await render();
    expect(el.textContent).toContain(messages['app.tagline']);
  });

  it('wraps content in a main landmark', async () => {
    const el = await render();
    expect(el.querySelector('main')).not.toBeNull();
  });

  it('shows the brand seal as a decorative SVG image', async () => {
    const el = await render();
    const seal = el.querySelector('img.seal') as HTMLImageElement | null;
    expect(seal).not.toBeNull();
    expect(seal!.getAttribute('src')).toMatch(/\.svg$/);
    expect(seal!.getAttribute('alt')).toBe('');
  });
});
