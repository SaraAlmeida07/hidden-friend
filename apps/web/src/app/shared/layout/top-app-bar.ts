import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideGift, LucideBell } from '@lucide/angular';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-top-app-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideGift, LucideBell, HlmButton],
  template: `
    <header class="sticky top-0 z-50 w-full h-[60px] bg-background/95 border-b border-border/40 backdrop-blur-md">
      <div class="flex items-center justify-between h-full px-6">
        <a routerLink="/events" class="flex items-center gap-2.5 no-underline">
          <svg lucideGift class="w-5 h-5 text-primary stroke-current" aria-hidden="true"></svg>
          <span class="text-lg font-bold text-foreground tracking-tight">Hidden Friend</span>
        </a>
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          class="text-muted-foreground hover:text-foreground"
          aria-label="Notificações"
          title="Notificações"
        >
          <svg lucideBell class="w-5 h-5" aria-hidden="true"></svg>
        </button>
      </div>
    </header>
  `
})
export class TopAppBarComponent {}
