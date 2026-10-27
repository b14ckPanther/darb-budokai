import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TOKENS } from '../design/tokens.generated';
import { LargeTitleComponent } from './large-title.component';
import { SheetComponent } from './sheet.component';
import { SwipeAction, SwipeRowComponent } from './swipe-row.component';

async function mount<T>(type: new (...a: never[]) => T): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({ imports: [type] }).compileComponents();
  const f = TestBed.createComponent(type);
  f.autoDetectChanges();
  await f.whenStable();
  return f;
}

function pointer(el: Element, type: string, x: number, y: number, timeStamp?: number) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  if (timeStamp !== undefined) Object.defineProperty(e, 'timeStamp', { value: timeStamp });
  el.dispatchEvent(e);
}

describe('bk-sheet', () => {
  @Component({
    imports: [SheetComponent],
    template: `<button id="opener" (click)="open.set(true)">Open</button>
      <bk-sheet [(open)]="open" [(detent)]="detent" title="Stretch for ten minutes">
        <button id="inside">Check in</button>
      </bk-sheet>`,
  })
  class Host {
    open = signal(false);
    detent = signal<'medium' | 'large'>('medium');
  }

  async function opened() {
    const f = await mount(Host);
    const opener = f.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus();
    opener.click();
    await f.whenStable();
    return f;
  }

  it('is a labelled modal dialog that takes focus', async () => {
    const f = await opened();
    const d = f.nativeElement.querySelector('[role=dialog]') as HTMLElement;
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(d.getAttribute('aria-labelledby')!)?.textContent).toContain(
      'Stretch',
    );
    expect(d.contains(document.activeElement)).toBe(true);
  });

  it('makes the page behind it inert while open, and restores it', async () => {
    const f = await opened();
    const opener = f.nativeElement.querySelector('#opener') as HTMLButtonElement;
    expect(opener.inert).toBe(true);
    f.componentInstance.open.set(false);
    await f.whenStable();
    expect(opener.inert).toBe(false);
  });

  it('closes on Escape and returns focus to the opener', async () => {
    const f = await opened();
    const d = f.nativeElement.querySelector('[role=dialog]') as HTMLElement;
    d.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(false);
    expect(document.activeElement?.id).toBe('opener');
  });

  it('closes from the scrim and from the close button', async () => {
    const f = await opened();
    (f.nativeElement.querySelector('.scrim') as HTMLElement).click();
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(false);
    f.componentInstance.open.set(true);
    await f.whenStable();
    (f.nativeElement.querySelector('button.close') as HTMLElement).click();
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(false);
  });

  it('the handle is a button that toggles detents from the keyboard', async () => {
    const f = await opened();
    const handle = f.nativeElement.querySelector('button.handle') as HTMLButtonElement;
    expect(handle.getAttribute('aria-expanded')).toBe('false');
    handle.click();
    await f.whenStable();
    expect(f.componentInstance.detent()).toBe('large');
    expect(handle.getAttribute('aria-expanded')).toBe('true');
  });

  // Slow drags (one second) so only the distance threshold can decide.
  async function slowDrag(px: number) {
    const f = await opened();
    const grab = f.nativeElement.querySelector('.grab') as HTMLElement;
    pointer(grab, 'pointerdown', 100, 100, 0);
    pointer(grab, 'pointermove', 100, 100 + px / 2, 500);
    pointer(grab, 'pointermove', 100, 100 + px, 1000);
    pointer(grab, 'pointerup', 100, 100 + px, 1000);
    await f.whenStable();
    return f.componentInstance.open();
  }

  it('a slow drag dismisses past the distance threshold and not before it', async () => {
    const limit = window.innerHeight * TOKENS.gesture['sheet-dismiss-fraction'];
    expect(await slowDrag(limit + 20)).toBe(false);
    TestBed.resetTestingModule();
    expect(await slowDrag(limit - 20)).toBe(true);
  });

  it('a tap on the handle (no movement) toggles the detent', async () => {
    const f = await opened();
    const handle = f.nativeElement.querySelector('button.handle') as HTMLButtonElement;
    pointer(handle, 'pointerdown', 100, 100, 0);
    pointer(handle, 'pointerup', 100, 101, 2);
    handle.click();
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(true);
    expect(f.componentInstance.detent()).toBe('large');
  });

  it('Shift+Tab from the panel itself wraps to the last control', async () => {
    const f = await opened();
    const panel = f.nativeElement.querySelector('[role=dialog]') as HTMLElement;
    expect(document.activeElement).toBe(panel);
    panel.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement?.id).toBe('inside');
  });

  it('restores the page if destroyed while open', async () => {
    const f = await opened();
    const opener = f.nativeElement.querySelector('#opener') as HTMLButtonElement;
    expect(opener.inert).toBe(true);
    f.destroy();
    expect(opener.inert).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });
});

describe('bk-large-title', () => {
  @Component({ imports: [LargeTitleComponent], template: `<bk-large-title title="Quests" />` })
  class Host {}

  afterEach(() => Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 }));

  it('starts collapsed when the page loads already scrolled', async () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 400 });
    const f = await mount(Host);
    expect((f.nativeElement.querySelector('.compact-title') as HTMLElement).style.opacity).toBe(
      '1',
    );
  });

  it('has one h1 and a compact bar title that appears as you scroll', async () => {
    const f = await mount(Host);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    const compact = el.querySelector('.compact-title') as HTMLElement;
    expect(compact.getAttribute('aria-hidden')).toBe('true');
    expect(compact.style.opacity).toBe('0');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 });
    window.dispatchEvent(new Event('scroll'));
    await f.whenStable();
    expect(compact.style.opacity).toBe('1');
  });
});

describe('bk-swipe-row', () => {
  @Component({
    imports: [SwipeRowComponent],
    template: `<bk-swipe-row title="Walk outside" [actions]="actions" (action)="last = $event">
      <span>The Springs</span>
    </bk-swipe-row>`,
  })
  class Host {
    last = '';
    actions: SwipeAction[] = [
      { id: 'check', label: 'Check in', icon: 'check', tone: 'accent' },
      { id: 'archive', label: 'Archive', icon: 'archive', tone: 'danger' },
    ];
  }

  it('keeps every action as a real button in the tab order', async () => {
    const f = await mount(Host);
    const buttons = Array.from(
      f.nativeElement.querySelectorAll('.actions button'),
    ) as HTMLButtonElement[];
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(['Check in', 'Archive']);
    expect(buttons.every((b) => b.tabIndex >= 0)).toBe(true);
    buttons[1].click();
    expect(f.componentInstance.last).toBe('archive');
  });

  it('opens when an action takes keyboard focus', async () => {
    const f = await mount(Host);
    const row = f.nativeElement.querySelector('bk-swipe-row') as HTMLElement;
    (row.querySelector('.actions button') as HTMLButtonElement).dispatchEvent(
      new FocusEvent('focusin', { bubbles: true }),
    );
    await f.whenStable();
    expect(row.classList).toContain('open');
  });

  it('a keyboard action keeps the row open so focus stays visible', async () => {
    const f = await mount(Host);
    const row = f.nativeElement.querySelector('bk-swipe-row') as HTMLElement;
    const btn = row.querySelector('.actions button') as HTMLButtonElement;
    btn.focus();
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    await f.whenStable();
    expect(f.componentInstance.last).toBe('check');
    expect(row.classList).toContain('open');
  });

  it('a cancelled drag snaps back and fires nothing', async () => {
    const f = await mount(Host);
    const content = f.nativeElement.querySelector('.content') as HTMLElement;
    Object.defineProperty(content, 'offsetWidth', { value: 360 });
    pointer(content, 'pointerdown', 340, 10);
    pointer(content, 'pointermove', 20, 12);
    pointer(content, 'pointercancel', 20, 12);
    await f.whenStable();
    expect(f.componentInstance.last).toBe('');
    expect(f.nativeElement.querySelector('bk-swipe-row').classList).not.toContain('open');
  });

  it('a long swipe commits the first action', async () => {
    const f = await mount(Host);
    const content = f.nativeElement.querySelector('.content') as HTMLElement;
    Object.defineProperty(content, 'offsetWidth', { value: 360 });
    pointer(content, 'pointerdown', 340, 10);
    pointer(content, 'pointermove', 20, 12);
    pointer(content, 'pointerup', 20, 12);
    await f.whenStable();
    expect(f.componentInstance.last).toBe('check');
  });
});
