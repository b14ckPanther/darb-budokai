import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { BattleLogStore } from '../../data/battlelog.store';
import { MapStore } from '../../data/map.store';
import { MotionService } from '../../design/motion/motion.service';
import { TOKENS } from '../../design/tokens.generated';
import { ButtonComponent } from '../../ui/button.component';
import { CountComponent } from '../../ui/count.component';
import { EvidenceBadgeComponent, EvidenceTier } from '../../ui/evidence-badge.component';
import { IconComponent } from '../../ui/icon.component';
import { Rarity, RarityComponent } from '../../ui/rarity.component';
import { SegmentedComponent } from '../../ui/segmented.component';
import { FlatMapComponent } from '../../world/flat-map.component';
import { webglAvailable } from '../../world/webgl';
import { WorldCanvasComponent } from '../../world/world-canvas.component';

const B = COPY.battlelog;

/** Battle Log (UI_DESIGN 2.4): the day replayed encounter by encounter across the map. */
@Component({
  selector: 'bk-battlelog-screen',
  imports: [
    ButtonComponent,
    CountComponent,
    EvidenceBadgeComponent,
    FlatMapComponent,
    IconComponent,
    RarityComponent,
    SegmentedComponent,
    WorldCanvasComponent,
  ],
  templateUrl: './battlelog-screen.component.html',
  styleUrl: './battlelog-screen.component.scss',
  host: { '(document:keydown)': 'onKey($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleLogScreenComponent {
  /** From the ?date= query parameter (router input binding). */
  readonly date = input<string>();
  readonly store = inject(BattleLogStore);
  readonly map = inject(MapStore);
  readonly motion = inject(MotionService);
  readonly b = B;
  readonly webgl = webglAvailable();
  readonly speeds = TOKENS.battlelog.speeds.map((s) => ({
    value: String(s),
    label: format(B['speed-value'], { speed: s }),
  }));
  readonly player = this.store.player;
  /** Only the play state drives the clock, not every tick. */
  private readonly playing = computed(() => this.player().playing);
  readonly day = this.store.day;
  readonly enc = this.store.encounter;
  readonly current = computed(() => (this.enc() ? [this.enc()!] : []));

  readonly regions = computed(() =>
    this.map
      .regions()
      .map((r) => ({ ...r, centre: [...r.centre], light: r.light * 0.35, fog: r.fog })),
  );
  private centreOf(region: string): number[] | null {
    const r = this.map.regions().find((x) => x.id === region);
    return r ? [...r.centre] : null;
  }
  readonly focus = computed(() => {
    const e = this.enc();
    return e ? this.centreOf(e.region) : null;
  });
  readonly pulse = computed(() => {
    const e = this.enc();
    const at = e ? this.centreOf(e.region) : null;
    return at
      ? { at, strength: e!.kind === 'boss' ? 2.4 : e!.kind === 'portal' ? 0.8 : 1.6 }
      : null;
  });
  readonly label = computed(() => {
    const e = this.enc();
    return e ? `${e.reading}. ${e.event}` : this.title();
  });
  readonly title = computed(() => format(B.date, { date: this.store.date() }));
  readonly position = computed(() => {
    const d = this.day();
    const p = this.player();
    return d && p.phase === 'encounter'
      ? format(B['encounter-of'], { index: p.index + 1, total: d.encounters.length })
      : '';
  });
  readonly dayOptions = computed(() => this.store.days().map((d) => ({ value: d, label: d })));
  readonly totals = computed(() => {
    const s = this.day()?.summary;
    if (!s) return [];
    return [
      format(B['end-xp'], { value: s.xp }),
      format(B['end-stamina'], { value: s.stamina >= 0 ? `+${s.stamina}` : s.stamina }),
      format(B['end-spells'], { value: s.spellsLearned }),
      ...s.fogChanges.map((f) =>
        format(B['end-fog'], {
          region: COPY.regions[f.region as keyof typeof COPY.regions]?.name ?? f.region,
          value: f.delta > 0 ? `+${f.delta}` : f.delta,
        }),
      ),
      format(B['end-tomorrow'], { cards: s.tomorrow.dueCards, quests: s.tomorrow.quests }),
    ];
  });

  constructor() {
    const zone = inject(NgZone);
    let frame = 0;
    let last = 0;
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(frame));
    effect(() => {
      const d = this.date();
      if (d && d !== this.store.date()) this.store.select(d);
    });
    // The clock runs only while playing; the reducer decides everything else.
    effect(() => {
      const playing = this.playing();
      cancelAnimationFrame(frame);
      if (!playing || typeof requestAnimationFrame === 'undefined') return;
      last = 0;
      zone.runOutsideAngular(() => {
        const step = (t: number) => {
          const dt = last ? Math.min(t - last, 100) : 0;
          last = t;
          // Ticks change what is on screen, so they run inside the zone.
          zone.run(() => this.store.dispatch({ type: 'tick', dt }));
          if (this.player().playing) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      });
    });
  }

  delta(d: { kind: string; amount: number }): string {
    const n = d.kind === 'fog' ? Math.round(d.amount * 100) : d.amount;
    return `${n > 0 ? '+' : ''}${n}${d.kind === 'fog' ? '%' : ''}`;
  }

  deltaFmt(kind: string): (n: number) => string {
    return (n) => {
      const v = kind === 'fog' ? Math.round(n * 100) : n;
      return `${v > 0 ? '+' : ''}${v}${kind === 'fog' ? '%' : ''}`;
    };
  }

  time(iso: string): string {
    return iso.slice(11, 16);
  }

  tier(t: string): EvidenceTier {
    return t as EvidenceTier;
  }

  rarity(r: string): Rarity {
    return r as Rarity;
  }

  lootText(name: string): string {
    return format(B.loot, { name });
  }

  sourceText(s: { eventId: string; ruleId: string }): string {
    return format(B.source, s);
  }

  startPct(ms: number): number {
    const total = this.store.timeline().totalMs;
    return total ? (ms / total) * 100 : 0;
  }

  seek(e: Event): void {
    this.store.dispatch({ type: 'seekMs', ms: Number((e.target as HTMLInputElement).value) });
  }

  setSpeed(v: string): void {
    this.store.dispatch({ type: 'speed', speed: Number(v) });
  }

  selectDay(d: string): void {
    this.store.select(d);
  }

  onKey(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (e.defaultPrevented || target?.closest?.('input, textarea, select, [role=radio]')) return;
    if (e.key === ' ' && !target?.closest?.('button, a')) {
      e.preventDefault();
      this.store.dispatch({ type: 'toggle' });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.store.dispatch({ type: 'next' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.store.dispatch({ type: 'prev' });
    }
  }
}
