import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Flight Tracking Dashboard',
    loadComponent: () => import('./core/map/map').then((m) => m.Map),
  },
];
