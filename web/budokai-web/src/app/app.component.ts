import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { COPY } from './copy/copy.generated';
import { DEMO_MODE, GAME_DATA } from './data/game-data';
import { MotionService } from './design/motion/motion.service';
import { NavComponent, NavItem } from './ui/nav.component';
import { ToastHostComponent } from './ui/toast-host.component';

/** App shell: tab bar or side rail, the demo banner, the routed screen and the toast region. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, ToastHostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly copy = COPY.shell;
  readonly demo = inject(DEMO_MODE);
  readonly hasData = inject(GAME_DATA) !== null;
  readonly nav: NavItem[] = [
    { path: '/map', label: COPY.nav.map, icon: 'map' },
    { path: '/quests', label: COPY.nav.quests, icon: 'quests' },
    { path: '/spellbook', label: COPY.nav.spellbook, icon: 'spellbook' },
    { path: '/character', label: COPY.nav.character, icon: 'character' },
    { path: '/log', label: COPY.nav.log, icon: 'log' },
  ];

  constructor() {
    // Instantiate early so html[data-motion] is set before the first screen paints.
    inject(MotionService);
  }
}
