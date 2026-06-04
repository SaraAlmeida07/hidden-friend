import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./event-create').then((m) => m.EventCreateComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./event-edit').then((m) => m.EventEditComponent),
  },
  {
    path: ':id/manage',
    loadComponent: () =>
      import('./event-manage').then((m) => m.EventManageComponent),
  },
  {
    path: ':id/results',
    loadComponent: () =>
      import('./event-results').then((m) => m.EventResultsComponent),
  },
];
