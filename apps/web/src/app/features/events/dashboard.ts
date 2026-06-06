import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucidePlus, LucideCalendarDays, LucideMapPin, LucideDollarSign } from '@lucide/angular';
import { EventService } from './event.service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    LucidePlus,
    LucideCalendarDays,
    LucideMapPin,
    LucideDollarSign,
    ...HlmCardImports,
    HlmBadge,
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
              <a
                [routerLink]="['/events', event.id, 'manage']"
                hlmCard
                class="hover:border-primary/40 hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4 text-card-foreground no-underline"
              >
                <div class="flex justify-between items-start gap-4">
                  <h3 hlmCardTitle class="text-lg font-bold text-foreground leading-tight m-0">{{ event.name }}</h3>
                  <span hlmBadge [variant]="event.status === 'draw_done' ? 'default' : 'secondary'">
                    {{ event.status === 'pending' ? 'Pendente' : 'Realizado' }}
                  </span>
                </div>
                
                <div class="flex flex-col gap-2.5 mt-auto">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg lucideCalendarDays class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
                    <span>{{ event.date | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg lucideMapPin class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
                    <span>{{ event.location }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg lucideDollarSign class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
                    <span>{{ event.suggested_gift_value | currency:'BRL' }}</span>
                  </div>
                </div>
              </a>
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
