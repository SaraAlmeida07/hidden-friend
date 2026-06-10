import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/events',
    pathMatch: 'full',
  },

  // Auth routes (no AppShell)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Protected routes (with AppShell layout serving as a parent view with its own nested children)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/app-shell').then((m) => m.AppShellComponent),
    children: [
      {
        path: 'events',
        loadChildren: () =>
          import('./features/events/events.routes').then(
            (m) => m.EVENTS_ROUTES,
          ),
      },
    ],
  },

  // Public participant routes (no AppShell, no auth)
  {
    path: 'invite',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },

  // Fallback
  { path: '**', redirectTo: '/events' },
];

