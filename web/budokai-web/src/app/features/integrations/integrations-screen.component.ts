import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { requireData } from '../../data/game-data';
import { ButtonComponent } from '../../ui/button.component';
import { DialogComponent } from '../../ui/dialog.component';
import { IconComponent } from '../../ui/icon.component';
import { ScreenComponent } from '../../ui/screen.component';

const I = COPY.integrations;

/** Integrations (UI_DESIGN 2.7): producers, scopes and rejected events. Core apps award; others are cosmetic. */
@Component({
  selector: 'bk-integrations-screen',
  imports: [ButtonComponent, DialogComponent, IconComponent, ScreenComponent],
  template: `
    <bk-screen [title]="i.title" [lede]="i.lede">
      <ul class="producers">
        @for (p of producers; track p.id) {
          <li class="producer" [class.off]="p.status === 'off'">
            <div class="head">
              <h2><bk-icon name="integrations" />{{ p.name }}</h2>
              <span class="status" [class]="'status st-' + p.status">{{ i.status[p.status] }}</span>
            </div>
            <p class="kind" [class.cosmetic]="p.kind === 'cosmetic'">{{ i.kinds[p.kind] }}</p>
            <dl>
              <dt>{{ i.scopes }}</dt>
              <dd class="scopes">
                @for (s of p.scopes; track s) {
                  <code>{{ s }}</code>
                }
              </dd>
              <dt class="visually-hidden">{{ i.title }}</dt>
              <dd class="muted">
                <bk-icon name="key" />{{ p.keyId ? key(p.keyId) : i['no-key'] }}.
                {{ p.lastEvent ? last(p.lastEvent) : i.never }}. {{ accepted(p.accepted7d) }}
              </dd>
            </dl>
            @if (p.rejected.length) {
              <h3>{{ i.rejected }}</h3>
              <ul class="rejected">
                @for (r of p.rejected; track r.at) {
                  <li>
                    <bk-icon name="warning" /><span
                      ><code>{{ r.type }}</code
                      >, {{ when(r.at) }}: {{ r.reason }}</span
                    >
                  </li>
                }
              </ul>
            }
            <button
              bk-button
              variant="secondary"
              icon="key"
              type="button"
              (click)="dialog.set(true)"
            >
              {{ p.keyId ? i.rotate : i.create }}
            </button>
          </li>
        }
      </ul>
    </bk-screen>
    <bk-dialog
      [(open)]="dialog"
      [title]="i['key-dialog-title']"
      [confirmLabel]="i.ok"
      confirmVariant="primary"
    >
      <p>{{ i['key-dialog-body'] }}</p>
    </bk-dialog>
  `,
  styleUrl: './integrations-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationsScreenComponent {
  readonly i = I;
  readonly producers = requireData().integrations.producers;
  readonly dialog = signal(false);

  when(iso: string): string {
    return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
  }

  key(id: string): string {
    return format(I.key, { id });
  }

  last(iso: string): string {
    return format(I['last-event'], { when: this.when(iso) });
  }

  accepted(count: number): string {
    return format(I.accepted, { count });
  }
}
