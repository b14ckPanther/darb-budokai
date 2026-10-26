import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import messages from '../locale/messages.en.json';

/** Phase 0 shell: brand seal, name and status. Real screens arrive in Phases 2 and 3. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly text = messages;

  constructor() {
    inject(Title).setTitle(messages['app.name']);
  }
}
