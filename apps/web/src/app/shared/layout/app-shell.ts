import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  host: {
    class: 'flex flex-col min-h-[100dvh] bg-background text-foreground'
  },
  template: `
    <app-header />

    <main class="flex-1 overflow-y-auto pb-[73px]">
      <router-outlet />
    </main>

    <app-footer />
  `
})
export class AppShellComponent {}

