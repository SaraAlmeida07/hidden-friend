import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopAppBarComponent } from './top-app-bar';
import { BottomNavBarComponent } from './bottom-nav-bar';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopAppBarComponent, BottomNavBarComponent],
  template: `
    <app-top-app-bar />

    <main class="app-shell__main">
      <router-outlet />
    </main>

    <app-bottom-nav-bar />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background-color: #0b1326;
    }

    .app-shell__main {
      flex: 1;
      overflow-y: auto;
      /* Reserve space for fixed BottomNavBar (73px) */
      padding-bottom: 73px;
    }
  `,
})
export class AppShellComponent {}
