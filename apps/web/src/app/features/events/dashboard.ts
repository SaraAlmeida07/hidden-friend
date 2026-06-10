import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePlus, LucideCalendarDays } from '@lucide/angular';
import { EventService } from './event.service';
import { EventCardComponent } from './event-card';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucidePlus,
    LucideCalendarDays,
    EventCardComponent,
    HlmButton
  ],
  template: `
    <div class="relative min-h-[calc(100dvh-133px)] bg-background overflow-hidden">
      <!-- Decorative blur -->
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] -top-20 -right-20 bg-primary/10 blur-[80px]"></div>

      <div class="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
        <!-- Hero -->
        <section class="flex flex-col gap-4 items-start">
          <h1 class="text-[44px] font-extrabold text-foreground leading-none m-0 tracking-tight">Seus Eventos</h1>
          <p class="text-lg text-muted-foreground m-0">
            Gerencie seus sorteios e acompanhe cada grupo.
          </p>
          <a routerLink="/events/new" hlmBtn class="w-fit">
            <svg lucidePlus class="w-5 h-5 mr-2" aria-hidden="true"></svg>
            Novo Evento
          </a>
        </section>

        @if (eventService.isLoading()) {
          <div class="flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
            <span class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            <p>Carregando eventos...</p>
          </div>
        } @else if (eventService.events().length === 0) {
          <!-- Empty state -->
          <section class="flex flex-col items-center gap-4 py-16 px-6 bg-card border border-dashed border-border rounded-xl text-center">
            <svg lucideCalendarDays class="w-12 h-12 stroke-muted-foreground/50" aria-hidden="true"></svg>
            <h2 class="text-lg font-semibold text-foreground m-0">Nenhum evento criado ainda</h2>
            <p class="text-sm text-muted-foreground m-0 max-w-[300px]">
              Crie seu primeiro amigo secreto e comece a diversão!
            </p>
          </section>
        } @else {
          <!-- Event List -->
          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (event of eventService.events(); track event.id) {
              @defer (on idle) {
                <app-event-card [event]="event" />
              } @placeholder {
                <div class="h-[188px] w-full rounded-xl bg-card border border-border/60 animate-pulse flex items-center justify-center text-muted-foreground text-xs">
                  Carregando informações...
                </div>
              }
            }
          </section>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  protected eventService = inject(EventService);

  ngOnInit(): void {
    this.eventService.loadEvents();
  }
}
