import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideCalendarDays, LucideUserCircle } from '@lucide/angular';

@Component({
  selector: 'app-bottom-nav-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideCalendarDays, LucideUserCircle],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 h-[73px] flex items-center justify-around bg-background/80 border-t border-border/40 shadow-[0_-4px_32px_0_rgba(109,40,217,0.06)] backdrop-blur-md">
      <a
        routerLink="/events"
        routerLinkActive="text-primary"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex flex-col items-center justify-center gap-1 px-6 py-2 no-underline text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Eventos"
      >
        <svg lucideCalendarDays class="w-5 h-5 stroke-current" aria-hidden="true"></svg>
        <span class="font-medium text-[11px] leading-tight">Eventos</span>
      </a>

      <a
        routerLink="/profile"
        routerLinkActive="text-primary"
        class="flex flex-col items-center justify-center gap-1 px-6 py-2 no-underline text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Perfil"
      >
        <svg lucideUserCircle class="w-5 h-5 stroke-current" aria-hidden="true"></svg>
        <span class="font-medium text-[11px] leading-tight">Perfil</span>
      </a>
    </nav>
  `
})
export class BottomNavBarComponent {}
