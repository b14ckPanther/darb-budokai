import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPY } from '../../copy/copy.generated';
import { GAME_DATA } from '../../data/game-data';
import { DEMO_DATA as DEMO_SEED } from '../../data/game-data';
import { SkillsScreenComponent } from './skills-screen.component';

const K = COPY.skills;

describe('Skill Tree', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [SkillsScreenComponent],
      providers: [provideRouter([]), { provide: GAME_DATA, useValue: DEMO_SEED }],
    }).compileComponents();
    const f = TestBed.createComponent(SkillsScreenComponent);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('lists every node with its state from the seed, as words', async () => {
    const el = await render();
    for (const n of DEMO_SEED['skill-tree'].nodes) {
      const row = el.querySelector(`[data-node="${n.id}"]`) as HTMLElement;
      expect(row).not.toBeNull();
      expect(row.textContent).toContain(K.states[n.state]);
    }
  });

  it('renders requirements and effects from config copy, and what each node needs', async () => {
    const el = await render();
    const n = DEMO_SEED['skill-tree'].nodes.find((x) => x.id === 'open-the-wilds')!;
    const row = el.querySelector(`[data-node="${n.id}"]`) as HTMLElement;
    expect(row.textContent).toContain(K.nodes['open-the-wilds'].requirement);
    expect(row.textContent).toContain(K.nodes['open-the-wilds'].effect);
    expect(row.textContent).toContain(K.nodes['gate-walker'].name);
  });
});
