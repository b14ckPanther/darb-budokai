import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import messages from '../locale/messages.en.json';
import { MotionService } from './design/motion/motion.service';
import { ToastHostComponent } from './ui/toast-host.component';

/** App shell: routed screens plus the app-wide toast region. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent],
  template: `<router-outlet /><bk-toast-host />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    inject(Title).setTitle(messages['app.name']);
    // Instantiate early so html[data-motion] is set before the first screen paints.
    inject(MotionService);
  }
}
