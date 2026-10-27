import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../copy/copy.generated';
import { TOKENS } from '../design/tokens.generated';
import { ButtonComponent } from './button.component';
import { DialogComponent } from './dialog.component';
import { EvidenceBadgeComponent } from './evidence-badge.component';
import { IconComponent } from './icon.component';
import { MeterComponent } from './meter.component';
import { NavComponent, NavItem } from './nav.component';
import { RarityComponent } from './rarity.component';
import { SegmentedComponent } from './segmented.component';
import { StatDialComponent } from './stat-dial.component';
import { ToastHostComponent } from './toast-host.component';
import { ToastService } from './toast.service';

function key(el: Element, k: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

async function mount<T>(type: new (...a: never[]) => T): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [type],
    providers: [provideRouter([])],
  }).compileComponents();
  const f = TestBed.createComponent(type);
  await f.whenStable();
  f.detectChanges();
  return f;
}

describe('bk-icon', () => {
  @Component({
    imports: [IconComponent],
    template: `<bk-icon name="map" /><bk-icon name="vigor" label="Vigor" />`,
  })
  class Host {}

  it('renders registry SVG, decorative unless labelled', async () => {
    const el = (await mount(Host)).nativeElement as HTMLElement;
    const [deco, named] = Array.from(el.querySelectorAll('svg'));
    expect(deco.getAttribute('aria-hidden')).toBe('true');
    expect(deco.innerHTML).toContain('path');
    expect(named.getAttribute('role')).toBe('img');
    expect(named.getAttribute('aria-label')).toBe('Vigor');
  });
});

describe('sigils', () => {
  @Component({
    imports: [IconComponent],
    template: `<bk-icon name="rarity-common" /><bk-icon name="attested" />`,
  })
  class Host {}

  it('draw unfilled unless a shape asks for fill (stroke-only shapes stay hollow)', async () => {
    const el = (await mount(Host)).nativeElement as HTMLElement;
    for (const svg of Array.from(el.querySelectorAll('svg'))) {
      expect(svg.getAttribute('fill')).toBe('none');
      for (const shape of Array.from(svg.querySelectorAll('path, circle, rect, ellipse'))) {
        expect(
          shape.hasAttribute('fill') ||
            shape.hasAttribute('stroke') ||
            shape.closest('[fill]') !== svg,
        ).toBe(true);
      }
    }
  });
});

describe('bk-button', () => {
  @Component({
    imports: [ButtonComponent],
    template: `<button
      bk-button
      variant="primary"
      icon="check"
      [loading]="loading()"
      (click)="clicks = clicks + 1"
    >
      Check in
    </button>`,
  })
  class Host {
    loading = signal(false);
    clicks = 0;
  }

  it('is a native button with a variant class and icon', async () => {
    const f = await mount(Host);
    const b = f.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(b.classList).toContain('bk-button--primary');
    expect(b.querySelector('svg')).not.toBeNull();
    b.click();
    expect(f.componentInstance.clicks).toBe(1);
  });

  it('marks loading as busy and blocks clicks', async () => {
    const f = await mount(Host);
    f.componentInstance.loading.set(true);
    await f.whenStable();
    f.detectChanges();
    const b = f.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(b.getAttribute('aria-busy')).toBe('true');
    expect(b.disabled).toBe(true);
  });
});

describe('bk-segmented', () => {
  @Component({
    imports: [SegmentedComponent],
    template: `<bk-segmented label="Quest tabs" [options]="opts" [(value)]="value" />`,
  })
  class Host {
    opts = [
      { value: 'today', label: 'Today' },
      { value: 'main', label: 'Main quests' },
      { value: 'raids', label: 'Raids' },
    ];
    value = signal('today');
  }

  it('is a radio group with roving focus and arrow keys', async () => {
    const f = await mount(Host);
    const group = f.nativeElement.querySelector('[role=radiogroup]') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Quest tabs');
    const radios = Array.from(group.querySelectorAll<HTMLElement>('[role=radio]'));
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
    key(radios[0], 'ArrowRight');
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.value()).toBe('main');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radios[1]);
    key(radios[1], 'End');
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('raids');
    key(radios[2], 'ArrowRight');
    await f.whenStable();
    expect(f.componentInstance.value()).toBe('today');
  });
});

describe('bk-nav', () => {
  @Component({ imports: [NavComponent], template: `<bk-nav label="Main" [items]="items" />` })
  class Host {
    items: NavItem[] = [
      { path: '/map', label: 'Map', icon: 'map' },
      { path: '/quests', label: 'Quests', icon: 'quests' },
    ];
  }

  it('is a labelled nav of links with visible text', async () => {
    const el = (await mount(Host)).nativeElement as HTMLElement;
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Main');
    const links = Array.from(nav.querySelectorAll('a'));
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Map', 'Quests']);
    expect(links[0].getAttribute('href')).toBe('/map');
  });
});

describe('bk-meter', () => {
  @Component({
    imports: [MeterComponent],
    template: `<bk-meter
      label="Experience"
      [value]="412"
      [max]="660"
      valueText="412 of 660 XP"
      tone="xp"
    />`,
  })
  class Host {}

  it('exposes a progressbar with value text that is also visible', async () => {
    const el = (await mount(Host)).nativeElement as HTMLElement;
    const bar = el.querySelector('[role=progressbar]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('412');
    expect(bar.getAttribute('aria-valuemax')).toBe('660');
    expect(bar.getAttribute('aria-valuetext')).toBe('412 of 660 XP');
    expect(el.textContent).toContain('412 of 660 XP');
    expect(el.textContent).toContain('Experience');
  });

  it('clamps the fill between 0 and 100 percent', async () => {
    @Component({
      imports: [MeterComponent],
      template: `<bk-meter
        label="Stamina"
        [value]="900"
        [max]="100"
        valueText="full"
        tone="stamina"
      />`,
    })
    class Over {}
    const el = (await mount(Over)).nativeElement as HTMLElement;
    expect((el.querySelector('.fill') as HTMLElement).style.inlineSize).toBe('100%');
  });
});

describe('bk-stat-dial', () => {
  @Component({
    imports: [StatDialComponent],
    template: `<bk-stat-dial stat="craft" [rank]="9" [progress]="0.71" />`,
  })
  class Host {}

  it('names the stat and rank in text, with the sigil', async () => {
    const el = (await mount(Host)).nativeElement as HTMLElement;
    expect(el.textContent).toContain(COPY.stats.craft.name);
    expect(el.textContent).toContain('Rank 9');
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')).toBe('71');
  });
});

describe('bk-evidence and bk-rarity', () => {
  @Component({
    imports: [EvidenceBadgeComponent, RarityComponent],
    template: `<bk-evidence tier="self_reported" /><bk-rarity rarity="legendary" />`,
  })
  class Host {}

  it('show a word next to the shape, never colour alone', async () => {
    const el = (await mount(Host)).nativeElement as HTMLElement;
    expect(el.textContent).toContain(COPY.evidence.self_reported.label);
    expect(el.textContent).toContain(COPY.rarity.legendary);
    expect(el.querySelector('bk-evidence')?.getAttribute('title')).toBe(
      COPY.evidence.self_reported.hint,
    );
  });
});

describe('bk-dialog', () => {
  @Component({
    imports: [DialogComponent],
    template: `<bk-dialog
      [(open)]="open"
      title="Archive this habit?"
      confirmLabel="Archive"
      (confirmed)="done = true"
    >
      <p>History stays.</p>
    </bk-dialog>`,
  })
  class Host {
    open = signal(false);
    done = false;
  }

  it('opens as a labelled modal dialog and confirms', async () => {
    const f = await mount(Host);
    f.componentInstance.open.set(true);
    await f.whenStable();
    f.detectChanges();
    const d = f.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(d.hasAttribute('open')).toBe(true);
    expect(d.getAttribute('aria-labelledby')).toBe(d.querySelector('h2')!.id);
    const confirm = Array.from(d.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Archive'),
    )!;
    confirm.click();
    await f.whenStable();
    expect(f.componentInstance.done).toBe(true);
    expect(f.componentInstance.open()).toBe(false);
  });

  it('closes on Escape (dialog cancel) without confirming', async () => {
    const f = await mount(Host);
    f.componentInstance.open.set(true);
    await f.whenStable();
    f.detectChanges();
    const d = f.nativeElement.querySelector('dialog') as HTMLDialogElement;
    d.dispatchEvent(new Event('cancel', { cancelable: true }));
    await f.whenStable();
    expect(f.componentInstance.open()).toBe(false);
    expect(f.componentInstance.done).toBe(false);
  });
});

describe('toasts', () => {
  afterEach(() => jest.useRealTimers());

  it('hold while hovered or focused, so a toast never vanishes under the pointer', async () => {
    const f = await mount(ToastHostComponent);
    jest.useFakeTimers();
    const svc = TestBed.inject(ToastService);
    svc.show('Spell learned', 'check');
    f.detectChanges();
    const region = f.nativeElement.querySelector('.stack') as HTMLElement;
    region.dispatchEvent(new Event('pointerenter'));
    jest.advanceTimersByTime(TOKENS.motion.duration.toast * 2);
    expect(svc.toasts()).toHaveLength(1);
    region.dispatchEvent(new Event('pointerleave'));
    jest.advanceTimersByTime(TOKENS.motion.duration.toast + 1);
    expect(svc.toasts()).toHaveLength(0);
  });

  it('announce politely and dismiss by button or after the token duration', async () => {
    const f = await mount(ToastHostComponent);
    jest.useFakeTimers();
    const svc = TestBed.inject(ToastService);
    svc.show('Stamina restored by 6', 'stamina');
    svc.show('Spell learned', 'check');
    f.detectChanges();
    const region = f.nativeElement.querySelector('[role=status]') as HTMLElement;
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.textContent).toContain('Stamina restored by 6');
    (region.querySelector('button') as HTMLButtonElement).click();
    f.detectChanges();
    expect(svc.toasts()).toHaveLength(1);
    jest.runAllTimers();
    expect(svc.toasts()).toHaveLength(0);
  });
});
