import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { IconName } from '../design/icons.generated';
import { TOKENS } from '../design/tokens.generated';
import { beyondSlop, swipeRelease } from './gestures';
import { IconComponent } from './icon.component';

export interface SwipeAction {
  id: string;
  label: string;
  icon: IconName;
  tone: 'accent' | 'neutral' | 'danger';
}

const REVEAL = TOKENS.gesture['swipe-reveal'];

/**
 * List row with trailing swipe actions. The actions are ordinary buttons in the tab order, so
 * keyboard and screen-reader users reach them without swiping; focusing one slides the row open.
 */
@Component({
  selector: 'bk-swipe-row',
  imports: [IconComponent],
  template: `
    <div class="actions" [style.inline-size.px]="actionsWidth()">
      @for (a of actions(); track a.id) {
        <button type="button" [class]="'act tone-' + a.tone" (click)="action.emit(a.id)">
          <bk-icon [name]="a.icon" />
          <span>{{ a.label }}</span>
        </button>
      }
    </div>
    <div
      class="content"
      [class.dragging]="dragging()"
      [style.transform]="'translateX(' + offset() + 'px)'"
      (pointerdown)="onDown($event)"
      (pointermove)="onMove($event)"
      (pointerup)="onUp($event)"
      (pointercancel)="onCancel()"
    >
      <div class="title">{{ title() }}</div>
      <div class="meta"><ng-content /></div>
    </div>
  `,
  host: {
    '[class.open]': 'isOpen()',
    '[style.--reveal]': "-actionsWidth() + 'px'",
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  styleUrl: './swipe-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwipeRowComponent {
  readonly title = input.required<string>();
  readonly actions = input.required<SwipeAction[]>();
  readonly action = output<string>();
  readonly isOpen = signal(false);
  readonly dragging = signal(false);
  private readonly dx = signal(0);
  readonly actionsWidth = computed(() => this.actions().length * REVEAL);
  readonly offset = computed(() =>
    this.dragging() ? this.dx() : this.isOpen() ? -this.actionsWidth() : 0,
  );
  private startX = 0;
  private startY = 0;
  private horizontal: boolean | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  /** A swipe past the commit point fires the first action and closes the row. A tapped or
   * keyboard-pressed action leaves the row as it is, so focus never lands on a hidden button. */
  private commit(id: string): void {
    this.isOpen.set(false);
    this.action.emit(id);
  }

  onCancel(): void {
    this.startX = this.startY = 0;
    this.dragging.set(false);
  }

  onFocusIn(e: FocusEvent): void {
    if ((e.target as HTMLElement).closest('.actions')) this.isOpen.set(true);
  }

  onFocusOut(e: FocusEvent): void {
    if (!this.host.nativeElement.contains(e.relatedTarget as Node | null)) this.isOpen.set(false);
  }

  onDown(e: PointerEvent): void {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.horizontal = null;
    this.dx.set(this.isOpen() ? -this.actionsWidth() : 0);
  }

  onMove(e: PointerEvent): void {
    if (this.startX === 0 && this.startY === 0) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    if (this.horizontal === null && beyondSlop(dx, dy)) {
      this.horizontal = Math.abs(dx) > Math.abs(dy);
      if (this.horizontal) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    if (!this.horizontal) return;
    this.dragging.set(true);
    const base = this.isOpen() ? -this.actionsWidth() : 0;
    this.dx.set(Math.min(0, base + dx));
  }

  onUp(e: PointerEvent): void {
    const wasDragging = this.dragging();
    this.startX = this.startY = 0;
    if (!wasDragging) return;
    const width = (e.currentTarget as HTMLElement).offsetWidth;
    const outcome = swipeRelease(this.dx(), width);
    this.dragging.set(false);
    if (outcome === 'commit') this.commit(this.actions()[0].id);
    else this.isOpen.set(outcome === 'open');
  }
}
