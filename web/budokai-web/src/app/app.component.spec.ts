import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import messages from '../locale/messages.en.json';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('hosts the router outlet and the toast region', async () => {
    const el = await render();
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('bk-toast-host [role=status]')).not.toBeNull();
  });

  it('sets the document title and the motion attribute', async () => {
    await render();
    expect(TestBed.inject(Title).getTitle()).toBe(messages['app.name']);
    expect(document.documentElement.dataset['motion']).toMatch(/^(full|reduced)$/);
  });
});
