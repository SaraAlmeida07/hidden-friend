import { Routes } from '@angular/router';
import { eventResolver } from './event.resolver';

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
    resolve: { event: eventResolver },
    loadComponent: () =>
      import('./event-edit').then((m) => m.EventEditComponent),
  },
  {
    path: ':id/manage',
    resolve: { event: eventResolver },
    loadComponent: () =>
      import('./event-manage').then((m) => m.EventManageComponent),
  },
  {
    path: ':id/results',
    resolve: { event: eventResolver },
    loadComponent: () =>
      import('./event-results').then((m) => m.EventResultsComponent),
  },
];
