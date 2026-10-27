import { ChangeDetectionStrategy, Component } from '@angular/core';
import { COPY } from '../../copy/copy.generated';
import { format } from '../../copy/format';
import { requireData } from '../../data/game-data';
import { ScreenComponent } from '../../ui/screen.component';

/** Rulebook (UI_DESIGN 2.7): every number the game uses, read-only. Honesty made visible. */
@Component({
  selector: 'bk-rulebook-screen',
  imports: [ScreenComponent],
  template: `
    <bk-screen [title]="r.title" [lede]="lede">
      <div class="tables">
        @for (t of tables; track t.id) {
          <div class="wrap" tabindex="0" [attr.aria-labelledby]="'cap-' + t.id">
            <table>
              <caption [id]="'cap-' + t.id">
                {{
                  caption(t.id)
                }}
              </caption>
              <thead>
                <tr>
                  @for (c of t.columns; track c) {
                    <th scope="col">{{ c }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of t.rows; track $index) {
                  <tr>
                    @for (cell of row; track $index; let first = $first) {
                      @if (first) {
                        <th scope="row">{{ cell }}</th>
                      } @else {
                        <td>{{ cell }}</td>
                      }
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </bk-screen>
  `,
  styles: `
    .tables {
      display: grid;
      gap: var(--space-6);
    }
    .wrap {
      overflow-x: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-hairline);
      background: var(--color-surface);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--type-subhead-size);
      font-variant-numeric: tabular-nums;
    }
    caption {
      padding: var(--space-4) var(--space-4) var(--space-2);
      text-align: left;
      font-family: var(--type-title-2-family);
      font-size: var(--type-title-2-size);
      color: var(--color-text-heading);
    }
    th,
    td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-top: 1px solid var(--color-hairline);
      vertical-align: top;
    }
    thead th {
      font-size: var(--type-footnote-size);
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    tbody th {
      font-weight: 400;
      color: var(--color-text);
    }
    td {
      color: var(--color-text-gold);
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulebookScreenComponent {
  readonly r = COPY.rulebook;
  private readonly data = requireData();
  readonly tables = this.data.rulebook.tables;
  readonly lede = format(COPY.rulebook.lede, { version: this.data.rulebook.version });

  caption(id: string): string {
    return COPY.rulebook.tables[id as keyof typeof COPY.rulebook.tables] ?? id;
  }
}
