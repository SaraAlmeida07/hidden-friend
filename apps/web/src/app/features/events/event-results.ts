import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { LucideArrowLeft, LucideCheck, LucideCopy } from '@lucide/angular';
import { EventService } from './event.service';
import { ParticipantService } from '../participants/participant.service';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-event-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe, LucideArrowLeft, LucideCheck, LucideCopy],
  template: `
    <div class="event-results">
      <div class="event-results__blur"></div>

      @if (isLoading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando resultados...</p>
        </div>
      } @else if (event()) {
        <div class="event-results__content">
          <header class="event-hero">
            <a routerLink="/events" class="back-link">
              <svg lucideArrowLeft class="back-link__icon" aria-hidden="true"></svg>
              Voltar ao Dashboard
            </a>
            
            <div class="event-hero__main">
              <div class="event-hero__title-group">
                <span class="badge badge--success">Sorteio Realizado</span>
                <h1 class="event-hero__title">{{ event()!.name }}</h1>
              </div>
            </div>

            <p class="event-hero__subtitle">
              O sorteio foi realizado! Agora compartilhe os links de acesso individuais com cada participante para que descubram quem tiraram.
            </p>
          </header>

          <section class="participant-links">
            <h2 class="section-title">Links de Acesso ({{ participantService.participants().length }})</h2>
            
            <div class="participants-grid">
              @for (p of participantService.participants(); track p.id) {
                <div class="participant-card">
                  <div class="participant-card__info">
                    <span class="participant-card__name">{{ p.name }}</span>
                    <span class="participant-card__email">{{ p.email }}</span>
                    <span class="participant-card__token-label">
                      Link: <span class="participant-card__token">/invite/{{ p.token | slice:0:8 }}...</span>
                    </span>
                  </div>
                  
                  <button 
                    class="btn btn--copy" 
                    [class.btn--copy-success]="copiedId() === p.id"
                    (click)="copyLink(p.id, p.token)"
                  >
                    @if (copiedId() === p.id) {
                      <svg lucideCheck class="btn__icon" aria-hidden="true"></svg>
                      <span>Copiado!</span>
                    } @else {
                      <svg lucideCopy class="btn__icon" aria-hidden="true"></svg>
                      <span>Copiar</span>
                    }
                  </button>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: `
    .event-results {
      position: relative;
      min-height: calc(100dvh - 133px);
      background-color: #0b1326;
      overflow: hidden;
    }

    .event-results__blur {
      position: absolute;
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
      background: rgba(16, 185, 129, 0.1);
      filter: blur(80px);
      border-radius: 9999px;
      pointer-events: none;
    }

    .event-results__content {
      position: relative;
      z-index: 1;
      padding: 32px 24px 64px;
      display: flex;
      flex-direction: column;
      gap: 40px;
      max-width: 600px;
      margin: 0 auto;
    }

    .event-hero {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      width: fit-content;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #dae2fd;
    }

    .back-link__icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    .event-hero__main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .event-hero__title-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .event-hero__title {
      font-size: 30px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 1.2;
      margin: 0;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: fit-content;
    }

    .badge--success {
      background-color: rgba(0, 165, 114, 0.1);
      border: 1px solid rgba(0, 165, 114, 0.3);
      color: #00a572;
    }

    .event-hero__subtitle {
      font-size: 16px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #dae2fd;
      margin: 0 0 16px 0;
    }

    .participant-links {
      display: flex;
      flex-direction: column;
    }

    .participants-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .participant-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background-color: #060e20;
      border: 1px solid rgba(74, 68, 85, 0.15);
      border-radius: 12px;
      padding: 16px;
    }

    .participant-card__info {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .participant-card__name {
      color: #dae2fd;
      font-weight: 700;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }

    .participant-card__email {
      color: #94a3b8;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 8px;
    }

    .participant-card__token-label {
      font-size: 11px;
      color: #6d28d9;
      font-weight: 600;
      background: rgba(109, 40, 217, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      width: fit-content;
    }

    .participant-card__token {
      color: #dae2fd;
      font-weight: 400;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn--copy {
      height: 40px;
      padding: 0 16px;
      background: rgba(255, 255, 255, 0.05);
      color: #dae2fd;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn--copy:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn--copy-success {
      background: rgba(0, 165, 114, 0.1);
      color: #00a572;
      border-color: rgba(0, 165, 114, 0.3);
    }

    .btn--copy-success:hover {
      background: rgba(0, 165, 114, 0.15);
    }

    .btn__icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      gap: 16px;
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
  `,
})
export class EventResultsComponent implements OnInit {
  private eventService = inject(EventService);
  protected participantService = inject(ParticipantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected event = signal<Event | null>(null);
  protected isLoading = signal<boolean>(true);
  protected copiedId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    this.eventService.getEventById(id).subscribe({
      next: (ev) => {
        if (ev.status !== 'draw_done') {
          this.router.navigate(['/events', id, 'manage']);
          return;
        }
        this.event.set(ev);
        this.isLoading.set(false);
      },
      error: () => {
        this.router.navigate(['/events']);
      }
    });

    this.participantService.loadParticipants(id).subscribe();
  }

  protected copyLink(participantId: string, token: string): void {
    const origin = window.location.origin;
    const link = `${origin}/invite/${token}`;
    
    navigator.clipboard.writeText(link).then(() => {
      this.copiedId.set(participantId);
      setTimeout(() => {
        if (this.copiedId() === participantId) {
          this.copiedId.set(null);
        }
      }, 2000);
    });
  }
}
