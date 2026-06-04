import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: ':token',
    loadComponent: () =>
      import('./participant-access').then((m) => m.ParticipantAccessComponent),
  },
  {
    path: ':token/reveal',
    loadComponent: () =>
      import('./draw-reveal').then((m) => m.DrawRevealComponent),
  },
];
