import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { HomeComponent } from './features/home/home.component';

const designRoutes: Routes = environment.designPage
  ? [
      {
        path: 'design',
        loadComponent: () =>
          import('./design/design-page.component').then((m) => m.DesignPageComponent),
      },
    ]
  : [];

export const routes: Routes = [
  { path: '', component: HomeComponent },
  ...designRoutes,
  { path: '**', redirectTo: '' },
];
