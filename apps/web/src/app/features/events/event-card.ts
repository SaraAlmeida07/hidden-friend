import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucideCalendarDays, LucideMapPin, LucideDollarSign } from '@lucide/angular';
import { Event } from '../../core/models/event.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    LucideCalendarDays,
    LucideMapPin,
    LucideDollarSign,
    ...HlmCardImports,
    HlmBadge
  ],
  template: `
    <a
      [routerLink]="['/events', event().id, 'manage']"
      hlmCard
      class="hover:border-primary/40 hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4 text-card-foreground no-underline h-full block"
    >
      <div class="flex justify-between items-start gap-4">
        <h3 hlmCardTitle class="text-lg font-bold text-foreground leading-tight m-0">{{ event().name }}</h3>
        <span hlmBadge [variant]="event().status === 'draw_done' ? 'default' : 'secondary'">
          {{ event().status === 'pending' ? 'Pendente' : 'Realizado' }}
        </span>
      </div>
      
      <div class="flex flex-col gap-2.5 mt-auto">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <svg lucideCalendarDays class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
          <span>{{ event().date | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <svg lucideMapPin class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
          <span>{{ event().location }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <svg lucideDollarSign class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
          <span>{{ event().suggested_gift_value | currency:'BRL' }}</span>
        </div>
      </div>
    </a>
  `
})
export class EventCardComponent {
  event = input.required<Event>();
}
