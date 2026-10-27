import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { Habit, HabitDraft, Objective, QuestStore } from '../../data/quest.store';
import { ButtonComponent } from '../../ui/button.component';
import { EvidenceBadgeComponent } from '../../ui/evidence-badge.component';
import { IconComponent } from '../../ui/icon.component';
import { MeterComponent } from '../../ui/meter.component';
import { ScreenComponent } from '../../ui/screen.component';
import { SegmentedComponent } from '../../ui/segmented.component';
import { SheetComponent } from '../../ui/sheet.component';
import { SwipeAction, SwipeRowComponent } from '../../ui/swipe-row.component';
import { ToastService } from '../../ui/toast.service';

const Q = COPY.quests;
type Tab = 'today' | 'main' | 'raids' | 'proposed' | 'history';

/** Quest Log (UI_DESIGN 2.5): tabs, swipe rows with button twins, and a local habit editor. */
@Component({
  selector: 'bk-quests-screen',
  imports: [
    ButtonComponent,
    EvidenceBadgeComponent,
    IconComponent,
    MeterComponent,
    ScreenComponent,
    SegmentedComponent,
    SheetComponent,
    SwipeRowComponent,
  ],
  templateUrl: './quests-screen.component.html',
  styleUrl: './quests-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestsScreenComponent {
  readonly store = inject(QuestStore);
  private readonly toasts = inject(ToastService);
  readonly q = Q;
  readonly regions = COPY.regions;
  readonly tab = signal<Tab>('today');
  readonly tabs = (['today', 'main', 'raids', 'proposed', 'history'] as const).map((v) => ({
    value: v,
    label: Q.tabs[v],
  }));
  readonly regionOptions = Object.entries(COPY.regions).map(([id, r]) => ({ id, name: r.name }));
  readonly objectiveOptions = (Object.keys(Q.objectives) as Objective[]).map((o) => ({
    id: o,
    name: Q.objectives[o],
  }));

  readonly editorOpen = signal(false);
  readonly draft = signal<HabitDraft>({
    title: '',
    region: 'springs',
    objective: 'checkin',
    target: 1,
  });
  readonly error = signal<string | null>(null);
  readonly todayText = computed(() => format(COPY.map['today-quests'], this.store.today()));

  setTab(v: string): void {
    this.tab.set(v as Tab);
  }

  actions(h: Habit): SwipeAction[] {
    const done = h.progress >= h.target;
    return [
      done
        ? { id: 'edit', label: Q['edit-habit'], icon: 'edit', tone: 'neutral' }
        : { id: 'check', label: Q['check-in'], icon: 'check', tone: 'accent' },
      { id: 'pause', label: Q.pause, icon: 'pause-habit', tone: 'neutral' },
      { id: 'archive', label: Q.archive, icon: 'archive', tone: 'danger' },
    ];
  }

  onAction(h: Habit, id: string): void {
    if (id === 'check') {
      this.store.checkIn(h.id);
      this.toasts.show(format(Q['checked-in'], { title: h.title }), 'check');
    } else if (id === 'pause') {
      this.store.setStatus(h.id, 'paused');
      this.toasts.show(format(Q['paused-toast'], { title: h.title }), 'pause-habit');
    } else if (id === 'archive') {
      this.store.setStatus(h.id, 'archived');
      this.toasts.show(format(Q.archived, { title: h.title }), 'archive');
    } else if (id === 'edit') {
      this.edit(h);
    }
  }

  resume(h: Habit): void {
    this.store.setStatus(h.id, 'active');
    this.toasts.show(format(Q['resumed-toast'], { title: h.title }), 'refresh');
  }

  progress(h: Habit): string {
    return h.unit
      ? format(Q['progress-unit'], { value: h.progress, target: h.target, unit: h.unit })
      : format(Q.progress, { value: h.progress, target: h.target });
  }

  streak(days: number): string {
    return days > 0 ? format(Q.streak, { days }) : Q['no-streak'];
  }

  stage(s: string): string {
    return Q.stages[s as keyof typeof Q.stages];
  }

  applied(date: string): string {
    return format(Q['applied-on'], { date });
  }

  hp(b: { hp: number; maxHp: number }): string {
    return format(Q['boss-hp'], { hp: b.hp, max: b.maxHp });
  }

  findings(b: { findings: readonly { resolved: boolean }[] }): string {
    return format(Q.findings, {
      resolved: b.findings.filter((f) => f.resolved).length,
      total: b.findings.length,
    });
  }

  historyRow(h: { completed: number; failed: number }): string {
    return format(Q['history-row'], h);
  }

  regionName(id: string): string {
    return COPY.regions[id as keyof typeof COPY.regions]?.name ?? id;
  }

  newHabit(): void {
    this.draft.set({ title: '', region: 'springs', objective: 'checkin', target: 1 });
    this.error.set(null);
    this.editorOpen.set(true);
  }

  edit(h: Habit): void {
    this.draft.set({
      id: h.id,
      title: h.title,
      region: h.region,
      objective: h.objective,
      target: h.target,
    });
    this.error.set(null);
    this.editorOpen.set(true);
  }

  patch(field: keyof HabitDraft, value: string): void {
    this.draft.update((d) => ({ ...d, [field]: field === 'target' ? Number(value) : value }));
  }

  save(e: Event): void {
    e.preventDefault();
    const d = this.draft();
    if (!d.title.trim()) return this.error.set(Q['habit-form']['error-title']);
    if (!Number.isInteger(d.target) || d.target < 1)
      return this.error.set(Q['habit-form']['error-target']);
    this.store.saveHabit({ ...d, title: d.title.trim() });
    this.toasts.show(format(Q['habit-form'].saved, { title: d.title.trim() }), 'check');
    this.editorOpen.set(false);
  }

  accept(p: { id: string; title: string }): void {
    this.store.acceptProposal(p.id);
    this.toasts.show(format(Q.accepted, { title: p.title }), 'check');
  }

  dismiss(p: { id: string; title: string }): void {
    this.store.dismissProposal(p.id);
    this.toasts.show(format(Q.dismissed, { title: p.title }), 'close');
  }
}
