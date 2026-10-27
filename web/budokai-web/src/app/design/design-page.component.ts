import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { COPY } from '../copy/copy.generated';
import { format } from '../copy/format';
import { DEMO_SEED } from '../demo/seed.generated';
import { ButtonComponent } from '../ui/button.component';
import { DialogComponent } from '../ui/dialog.component';
import { EvidenceBadgeComponent, EvidenceTier } from '../ui/evidence-badge.component';
import { IconComponent } from '../ui/icon.component';
import { LargeTitleComponent } from '../ui/large-title.component';
import { MeterComponent } from '../ui/meter.component';
import { Rarity, RarityComponent } from '../ui/rarity.component';
import { SegmentedComponent } from '../ui/segmented.component';
import { SheetComponent } from '../ui/sheet.component';
import { StatDialComponent, StatId } from '../ui/stat-dial.component';
import { SwipeAction, SwipeRowComponent } from '../ui/swipe-row.component';
import { ToastService } from '../ui/toast.service';
import { MapLookComponent } from '../world/map-look.component';
import { contrastRatio } from './build/colour';
import { ICONS, IconName } from './icons.generated';
import { MotionPreference, MotionService } from './motion/motion.service';
import { TOKENS } from './tokens.generated';

const PAGE = COPY.design;
const SAMPLE = PAGE.samples;
const SEED = DEMO_SEED.showcase;

/** Living style page (dev and demo only, PLAN Phase 2 task 8). Everything shown comes from tokens. */
@Component({
  selector: 'bk-design-page',
  imports: [
    ButtonComponent,
    DialogComponent,
    EvidenceBadgeComponent,
    IconComponent,
    LargeTitleComponent,
    MapLookComponent,
    MeterComponent,
    RarityComponent,
    SegmentedComponent,
    SheetComponent,
    StatDialComponent,
    SwipeRowComponent,
  ],
  templateUrl: './design-page.component.html',
  styleUrl: './design-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignPageComponent {
  readonly page = PAGE;
  readonly sample = SAMPLE;
  readonly ui = COPY.ui;
  readonly seed = SEED;
  readonly motion = inject(MotionService);
  private readonly toasts = inject(ToastService);

  readonly motionOptions = (['system', 'reduced', 'full'] as const).map((v) => ({
    value: v,
    label: COPY.ui.motion[v],
  }));
  readonly motionValue = computed(() => this.motion.preference());

  readonly swatches = Object.entries(TOKENS.themes.dark).map(([role, hex]) => {
    const ratio = contrastRatio(hex, TOKENS.themes.dark.bg);
    return {
      role,
      hex,
      ratio: format(SAMPLE.contrast, { ratio: ratio.toFixed(1) }),
      light: ratio > 6,
    };
  });

  readonly typeRoles = Object.entries(TOKENS.type).map(([role, t]) => ({
    role,
    spec: `${'fluid' in t ? `${t.fluid[0]} to ${t.fluid[1]}` : t.size} rem, ${t.line}`,
  }));

  readonly space = Object.entries(TOKENS.space).filter(([, v]) => v > 0);
  readonly radii = Object.entries(TOKENS.radius).filter(([k]) => k !== 'pill');
  readonly elevations = Object.keys(TOKENS.elevation);

  readonly springs = Object.entries(TOKENS.motion.springs).map(([name, s]) => ({
    name,
    ms: s.durationMs,
    play: format(SAMPLE['play-spring'], { name }),
    points: s.points
      .map(
        (p, i) => `${((i / (s.points.length - 1)) * 200).toFixed(1)},${(70 - p * 50).toFixed(1)}`,
      )
      .join(' '),
  }));
  readonly played = signal<Record<string, boolean>>({});

  readonly uiIcons = Object.entries(ICONS)
    .filter(([, i]) => i.kind === 'ui')
    .map(([n]) => n as IconName);
  readonly sigils = Object.entries(ICONS)
    .filter(([, i]) => i.kind === 'sigil')
    .map(([n]) => n as IconName);

  readonly stats = SEED.stats.map((s) => ({ ...s, id: s.id as StatId }));
  readonly character = SEED.character;
  readonly xpText = format(COPY.character['xp-value'], {
    value: SEED.character.xp,
    max: SEED.character.xpNext,
  });
  readonly staminaText = format(COPY.character['stamina-value'], {
    value: SEED.character.stamina,
    max: SEED.character.staminaMax,
  });
  readonly charCopy = COPY.character;
  readonly levelText = format(COPY.character.level, { level: SEED.character.level });
  readonly typeSample = format(SAMPLE['type-sample'], {
    name: SEED.character.name,
    level: this.levelText,
  });
  readonly tiers = Object.keys(COPY.evidence) as EvidenceTier[];
  readonly rarities = Object.keys(COPY.rarity) as Rarity[];
  readonly quests = SEED.quests.map((q) => ({ ...q, evidence: q.evidence as EvidenceTier }));
  readonly items = SEED.items.map((i) => ({ ...i, rarity: i.rarity as Rarity }));
  readonly rowActions: SwipeAction[] = [
    { id: 'check', label: SAMPLE.primary, icon: 'check', tone: 'accent' },
    { id: 'archive', label: SAMPLE.archive, icon: 'archive', tone: 'danger' },
  ];

  readonly tab = signal('today');
  readonly tabs = [
    { value: 'today', label: SAMPLE['tab-today'] },
    { value: 'main', label: SAMPLE['tab-main'] },
    { value: 'raids', label: SAMPLE['tab-raids'] },
  ];
  readonly sheetOpen = signal(false);
  readonly dialogOpen = signal(false);
  readonly levels = ['quiet', 'active', 'blazing'] as const;
  readonly levelName = (l: (typeof this.levels)[number]) => SAMPLE[`level-${l}`];

  setMotion(v: string): void {
    this.motion.setPreference(v as MotionPreference);
  }

  play(name: string): void {
    this.played.update((p) => ({ ...p, [name]: !p[name] }));
  }

  toast(): void {
    this.toasts.show(SAMPLE.toast, 'stamina');
  }
}
