import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopAppBarComponent } from './top-app-bar';
import { BottomNavBarComponent } from './bottom-nav-bar';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopAppBarComponent, BottomNavBarComponent],
  host: {
    class: 'flex flex-col min-h-[100dvh] bg-background text-foreground'
  },
  template: `
    <app-top-app-bar />

    <main class="flex-1 overflow-y-auto pb-[73px]">
      <router-outlet />
    </main>

    <app-bottom-nav-bar />
  `
})
export class AppShellComponent {}
