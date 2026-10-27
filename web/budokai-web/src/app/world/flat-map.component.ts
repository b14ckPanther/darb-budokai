import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TOKENS } from '../design/tokens.generated';
import type { SceneMarker, SceneRegion } from './engine/world-scene';

/**
 * The map without WebGL: the same regions and markers drawn flat in SVG, seen from above. It is a
 * picture; the screen's place list stays the way to act on it.
 */
@Component({
  selector: 'bk-flat-map',
  template: `
    <svg
      [attr.viewBox]="viewBox"
      role="img"
      [attr.aria-label]="label()"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect
        [attr.x]="-half"
        [attr.y]="-half"
        [attr.width]="size"
        [attr.height]="size"
        class="ground"
      />
      @for (r of regions(); track r.id) {
        <circle
          [attr.cx]="r.centre[0]"
          [attr.cy]="r.centre[1]"
          [attr.r]="r.radius"
          [attr.fill]="r.tint"
          [attr.fill-opacity]="0.25 + r.light * 0.6"
          class="region"
        />
        @for (k of rings; track k) {
          <circle
            [attr.cx]="r.centre[0]"
            [attr.cy]="r.centre[1]"
            [attr.r]="r.radius * k"
            class="contour"
          />
        }
        <circle
          [attr.cx]="r.centre[0]"
          [attr.cy]="r.centre[1]"
          [attr.r]="r.radius"
          class="dust"
          [attr.fill-opacity]="r.fog * 0.7"
        />
        <circle
          [attr.cx]="r.centre[0]"
          [attr.cy]="r.centre[1]"
          [attr.r]="r.radius * 0.3 * r.light"
          class="ember"
        />
      }
      @for (m of markers(); track m.id) {
        <g
          [attr.transform]="'translate(' + m.at[0] + ' ' + m.at[1] + ')'"
          [class.selected]="m.id === selected()"
          class="marker"
        >
          @if (m.kind === 'boss') {
            <path d="M0 -0.9 L0.9 0 L0 0.9 L-0.9 0 Z" />
          } @else if (m.kind === 'portal') {
            <circle r="0.7" class="ring" />
          } @else {
            <path d="M-0.6 0.6 L0 -0.9 L0.6 0.6 Z" />
          }
        </g>
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
      background: var(--color-bg-deep);
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .ground {
      fill: var(--color-surface-sunken);
    }
    .contour {
      fill: none;
      stroke: var(--color-accent);
      stroke-opacity: 0.45;
      stroke-width: 0.06;
    }
    .dust {
      fill: var(--color-stone);
    }
    .ember {
      fill: var(--color-ki);
      opacity: 0.6;
    }
    .marker path {
      fill: var(--color-accent);
    }
    .marker .ring {
      fill: none;
      stroke: var(--color-stone);
      stroke-width: 0.18;
    }
    .marker.selected path {
      fill: var(--color-ki-hot);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlatMapComponent {
  readonly label = input.required<string>();
  readonly regions = input<SceneRegion[]>([]);
  readonly markers = input<SceneMarker[]>([]);
  readonly selected = input<string | null>(null);
  readonly size = TOKENS.map.size;
  readonly half = TOKENS.map.size / 2;
  readonly viewBox = `${-this.half} ${-this.half} ${this.size} ${this.size}`;
  readonly rings = [0.75, 0.5, 0.25];
  readonly any = computed(() => this.regions().length > 0);
}
