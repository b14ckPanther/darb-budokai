import { ChangeDetectionStrategy, Component } from '@angular/core';
import messages from '../../../locale/messages.en.json';

/** Landing: brand seal, name and status. Phase 3 replaces it with the World Map. */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly text = messages;
}
