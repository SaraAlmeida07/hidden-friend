import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucidePlus, LucideCalendarDays, LucideMapPin, LucideDollarSign } from '@lucide/angular';
import { EventService } from './event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, CurrencyPipe, LucidePlus, LucideCalendarDays, LucideMapPin, LucideDollarSign],
  template: `
    <div class="dashboard">
      <div class="dashboard__blur"></div>

      <div class="dashboard__content">
        <!-- Hero -->
        <section class="dashboard__hero">
          <h1 class="dashboard__title">Seus Eventos</h1>
          <p class="dashboard__subtitle">
            Gerencie seus sorteios e acompanhe cada grupo.
          </p>
          <a routerLink="/events/new" class="btn btn--primary">
            <svg lucidePlus class="btn__icon" aria-hidden="true"></svg>
            Novo Evento
          </a>
        </section>

        @if (eventService.isLoading()) {
          <div class="dashboard__loading">
            <span class="spinner"></span>
            <p>Carregando eventos...</p>
          </div>
        } @else if (eventService.events().length === 0) {
          <!-- Empty state -->
          <section class="dashboard__empty">
            <svg lucideCalendarDays class="dashboard__empty-icon" aria-hidden="true"></svg>
            <h2 class="dashboard__empty-title">Nenhum evento criado ainda</h2>
            <p class="dashboard__empty-text">
              Crie seu primeiro amigo secreto e comece a diversão!
            </p>
          </section>
        } @else {
          <!-- Event List -->
          <section class="dashboard__list">
            @for (event of eventService.events(); track event.id) {
              <a [routerLink]="['/events', event.id, 'manage']" class="event-card">
                <div class="event-card__header">
                  <h3 class="event-card__title">{{ event.name }}</h3>
                  <span class="badge" [class.badge--success]="event.status === 'draw_done'">
                    {{ event.status === 'pending' ? 'Sorteio Pendente' : 'Sorteio Realizado' }}
                  </span>
                </div>
                
                <div class="event-card__details">
                  <div class="detail-item">
                    <svg lucideCalendarDays class="detail-icon" aria-hidden="true"></svg>
                    <span>{{ event.date | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="detail-item">
                    <svg lucideMapPin class="detail-icon" aria-hidden="true"></svg>
                    <span>{{ event.location }}</span>
                  </div>
                  <div class="detail-item">
                    <svg lucideDollarSign class="detail-icon" aria-hidden="true"></svg>
                    <span>{{ event.suggested_gift_value | currency:'BRL' }}</span>
                  </div>
                </div>
              </a>
            }
          </section>
        }
      </div>
    </div>
  `,
  styles: `
    .dashboard {
      position: relative;
      min-height: calc(100dvh - 133px);
      background-color: #0b1326;
      overflow: hidden;
    }

    .dashboard__blur {
      position: absolute;
      width: 400px;
      height: 400px;
      top: -100px;
      right: -100px;
      background: rgba(109, 40, 217, 0.1);
      filter: blur(80px);
      border-radius: 9999px;
      pointer-events: none;
    }

    .dashboard__content {
      position: relative;
      z-index: 1;
      padding: 48px 24px 32px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .dashboard__hero {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dashboard__title {
      font-size: 44px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 55px;
      margin: 0;
    }

    .dashboard__subtitle {
      font-size: 18px;
      color: #ccc3d7;
      line-height: 29px;
      margin: 0;
    }

    .dashboard__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px 24px;
      background-color: #131b2e;
      border: 1px dashed rgba(74, 68, 85, 0.4);
      border-radius: 12px;
      text-align: center;
    }

    .dashboard__empty-icon {
      width: 48px;
      height: 48px;
      stroke: #4a4455;
    }

    .dashboard__empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #94a3b8;
      margin: 0;
    }

    .dashboard__empty-text {
      font-size: 14px;
      color: #4a4455;
      margin: 0;
    }

    .dashboard__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px 24px;
      color: #94a3b8;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(109, 40, 217, 0.3);
      border-top-color: #6d28d9;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .dashboard__list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .event-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: #060e20;
      border: 1px solid rgba(74, 68, 85, 0.15);
      border-radius: 12px;
      padding: 20px;
      text-decoration: none;
      transition: transform 0.2s, border-color 0.2s;
    }

    .event-card:hover {
      transform: translateY(-2px);
      border-color: rgba(109, 40, 217, 0.4);
    }

    .event-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .event-card__title {
      font-size: 20px;
      font-weight: 700;
      color: #dae2fd;
      margin: 0;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      background-color: rgba(148, 163, 184, 0.1);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge--success {
      background-color: rgba(0, 165, 114, 0.1);
      color: #00a572;
    }

    .event-card__details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ccc3d7;
      font-size: 14px;
    }

    .detail-icon {
      width: 16px;
      height: 16px;
      stroke: #6d28d9;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 56px;
      padding: 0 32px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.1s, opacity 0.2s;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn--primary {
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: #ffffff;
      box-shadow: 0px 8px 32px rgba(83, 0, 183, 0.2);
      width: fit-content;
    }

    .btn__icon {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }
  `,
})
export class DashboardComponent implements OnInit {
  protected eventService = inject(EventService);

  ngOnInit(): void {
    this.eventService.loadEvents().subscribe();
  }
}
