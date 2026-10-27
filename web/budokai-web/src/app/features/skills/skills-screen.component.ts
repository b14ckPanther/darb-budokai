import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { requireData } from '../../data/game-data';
import { MotionService } from '../../design/motion/motion.service';
import { ButtonComponent } from '../../ui/button.component';
import { IconComponent } from '../../ui/icon.component';
import { ScreenComponent } from '../../ui/screen.component';
import type { ConstellationScene } from '../../world/engine/constellation-scene';
import { webglAvailable } from '../../world/webgl';

const K = COPY.skills;
type NodeId = keyof typeof K.nodes;

/** Skill Tree (UI_DESIGN 2.3): a constellation for the eye and a full list for everyone. */
@Component({
  selector: 'bk-skills-screen',
  imports: [RouterLink, ButtonComponent, IconComponent, ScreenComponent],
  templateUrl: './skills-screen.component.html',
  styleUrl: './skills-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsScreenComponent {
  readonly k = K;
  readonly back = COPY.character.title;
  readonly webgl = webglAvailable();
  private readonly data = requireData();
  readonly groups = computed(() =>
    (Object.keys(COPY.stats) as (keyof typeof COPY.stats)[]).map((stat) => ({
      stat,
      name: COPY.stats[stat].name,
      nodes: this.data['skill-tree'].nodes
        .filter((n) => n.stat === stat)
        .map((n) => {
          const copy = K.nodes[n.id as NodeId];
          return {
            ...n,
            ...copy,
            progressText: format(K.progress, { value: n.progress[0], target: n.progress[1] }),
            needs: n.requires.length
              ? format(K.requires, {
                  names: n.requires.map((r) => K.nodes[r as NodeId].name).join(', '),
                })
              : null,
          };
        }),
    })),
  );
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('sky');
  private readonly scene = signal<ConstellationScene | null>(null);
  private readonly motion = inject(MotionService);

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const c = this.canvas()?.nativeElement;
      if (!c) return;
      let destroyed = false;
      destroyRef.onDestroy(() => (destroyed = true));
      zone.runOutsideAngular(async () => {
        const { ConstellationScene } = await import('../../world/engine/constellation-scene');
        if (destroyed) return;
        const s = new ConstellationScene(c, [...this.data['skill-tree'].nodes]);
        let onScreen = true;
        const sync = () => s.setVisible(onScreen && document.visibilityState !== 'hidden');
        const ro = new ResizeObserver(([e]) =>
          s.resize(e.contentRect.width, e.contentRect.height, devicePixelRatio),
        );
        const io = new IntersectionObserver(([e]) => {
          onScreen = e.isIntersecting;
          sync();
        });
        ro.observe(c);
        io.observe(c);
        document.addEventListener('visibilitychange', sync);
        destroyRef.onDestroy(() => {
          ro.disconnect();
          io.disconnect();
          document.removeEventListener('visibilitychange', sync);
          s.dispose();
        });
        zone.run(() => this.scene.set(s));
      });
    });
    effect(() => this.scene()?.setAnimate(!this.motion.reduced()));
  }

  icon(state: string) {
    return state === 'unlocked' ? 'unlocked' : state === 'available' ? 'ember' : 'locked';
  }
}
