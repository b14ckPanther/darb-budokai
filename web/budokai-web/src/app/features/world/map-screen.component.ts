import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { CharacterStore } from '../../data/character.store';
import { MapStore } from '../../data/map.store';
import { QuestStore } from '../../data/quest.store';
import { TOKENS } from '../../design/tokens.generated';
import { ButtonComponent } from '../../ui/button.component';
import { EvidenceBadgeComponent } from '../../ui/evidence-badge.component';
import { IconComponent } from '../../ui/icon.component';
import { MeterComponent } from '../../ui/meter.component';
import { SheetComponent } from '../../ui/sheet.component';
import type { Pick } from '../../world/engine/world-scene';
import { FlatMapComponent } from '../../world/flat-map.component';
import { webglAvailable } from '../../world/webgl';
import { WorldCanvasComponent } from '../../world/world-canvas.component';
import { IconName } from '../../design/icons.generated';

const MARKER_ICON: Record<string, IconName> = {
  'main-quest': 'route',
  raid: 'raid',
  boss: 'boss',
  portal: 'ember',
};

/** World Map (UI_DESIGN 2.1): the 3D arena, a HUD, and a place list that is its keyboard twin. */
@Component({
  selector: 'bk-map-screen',
  imports: [
    RouterLink,
    ButtonComponent,
    EvidenceBadgeComponent,
    FlatMapComponent,
    IconComponent,
    MeterComponent,
    SheetComponent,
    WorldCanvasComponent,
  ],
  templateUrl: './map-screen.component.html',
  styleUrl: './map-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapScreenComponent {
  readonly map = inject(MapStore);
  readonly hero = inject(CharacterStore);
  readonly quests = inject(QuestStore);
  readonly copy = COPY.map;
  readonly charCopy = COPY.character;
  readonly webgl = webglAvailable();
  readonly canvasRatio = TOKENS.world['phone-canvas-ratio'];
  readonly sheetOpen = signal(false);

  readonly sceneRegions = computed(() =>
    this.map.regions().map((r) => ({ ...r, centre: [...r.centre] })),
  );
  readonly sceneMarkers = computed(() =>
    this.map.markers().map((m) => ({ id: m.id, kind: m.kind, at: [...m.at] })),
  );
  readonly labelNames = computed(() => this.map.regions().map((r) => ({ id: r.id, name: r.name })));
  readonly label = computed(() =>
    format(this.copy['canvas-label'], { summary: this.map.summary() }),
  );
  readonly focus = computed(() => {
    const m = this.map.selectedMarker();
    if (m) return m.at;
    return this.map.selectedRegion()?.centre ?? null;
  });
  readonly todayText = computed(() => format(this.copy['today-quests'], this.quests.today()));
  readonly levelText = computed(() =>
    format(this.charCopy.level, { level: this.hero.character().level }),
  );
  readonly xpText = computed(() => {
    const c = this.hero.character();
    return format(this.charCopy['xp-value'], {
      value: c.xp - c.xpLevelStart,
      max: c.xpNext - c.xpLevelStart,
    });
  });
  readonly staminaText = computed(() => {
    const c = this.hero.character();
    return format(this.charCopy['stamina-value'], { value: c.stamina, max: c.staminaMax });
  });

  pct(v: number): string {
    return format(this.copy.percent, { value: Math.round(v * 100) });
  }

  markerIcon(kind: string): IconName {
    return MARKER_ICON[kind] ?? 'target';
  }

  open(id: string): void {
    this.map.select(id);
    this.sheetOpen.set(true);
  }

  onPick(p: Pick): void {
    const id = p.marker ?? p.region;
    if (id) this.open(id);
  }

  onSheet(open: boolean): void {
    this.sheetOpen.set(open);
    if (!open) this.map.select(null);
  }

  sheetTitle(): string {
    return this.map.selectedMarker()?.label ?? this.map.selectedRegion()?.name ?? '';
  }
}
