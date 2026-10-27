import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';
import { environment } from '../environments/environment';
import messages from '../locale/messages.en.json';
import { COPY } from './copy/copy.generated';

const designRoutes: Routes = environment.designPage
  ? [
      {
        path: 'design',
        title: COPY.design.title,
        loadComponent: () =>
          import('./design/design-page.component').then((m) => m.DesignPageComponent),
      },
    ]
  : [];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'map' },
  {
    path: 'map',
    title: COPY.map.title,
    loadComponent: () =>
      import('./features/world/map-screen.component').then((m) => m.MapScreenComponent),
  },
  {
    path: 'quests',
    title: COPY.quests.title,
    loadComponent: () =>
      import('./features/quests/quests-screen.component').then((m) => m.QuestsScreenComponent),
  },
  {
    path: 'spellbook',
    title: COPY.spellbook.title,
    loadComponent: () =>
      import('./features/spellbook/spellbook-screen.component').then(
        (m) => m.SpellbookScreenComponent,
      ),
  },
  {
    path: 'spellbook/:deck',
    title: COPY.spellbook.title,
    loadComponent: () =>
      import('./features/spellbook/review-screen.component').then((m) => m.ReviewScreenComponent),
  },
  {
    path: 'character',
    title: COPY.character.title,
    loadComponent: () =>
      import('./features/character/character-screen.component').then(
        (m) => m.CharacterScreenComponent,
      ),
  },
  {
    path: 'character/skills',
    title: COPY.skills.title,
    loadComponent: () =>
      import('./features/skills/skills-screen.component').then((m) => m.SkillsScreenComponent),
  },
  {
    path: 'log',
    title: COPY.battlelog.title,
    loadComponent: () =>
      import('./features/battlelog/battlelog-screen.component').then(
        (m) => m.BattleLogScreenComponent,
      ),
  },
  {
    path: 'rulebook',
    title: COPY.rulebook.title,
    loadComponent: () =>
      import('./features/rulebook/rulebook-screen.component').then(
        (m) => m.RulebookScreenComponent,
      ),
  },
  {
    path: 'integrations',
    title: COPY.integrations.title,
    loadComponent: () =>
      import('./features/integrations/integrations-screen.component').then(
        (m) => m.IntegrationsScreenComponent,
      ),
  },
  ...designRoutes,
  { path: '**', redirectTo: 'map' },
];

/** "World map | Darb Budokai" */
@Injectable({ providedIn: 'root' })
export class BudokaiTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} | ${messages['app.name']}` : messages['app.name']);
  }
}
