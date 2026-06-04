import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucideArrowLeft, LucideCalendarDays, LucideMapPin, LucideDollarSign, LucideSettings, LucideUserPlus, LucideTrash2, LucideWand2 } from '@lucide/angular';
import { EventService } from './event.service';
import { ParticipantService } from '../participants/participant.service';
import { DrawService } from '../draw/draw.service';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-event-manage',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, LucideArrowLeft, LucideCalendarDays, LucideMapPin, LucideDollarSign, LucideSettings, LucideUserPlus, LucideTrash2, LucideWand2],
  template: `
    <div class="event-manage">
      <div class="event-manage__blur"></div>

      @if (isLoading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando evento...</p>
        </div>
      } @else if (event()) {
        <div class="event-manage__content">
          <!-- Header/Hero -->
          <header class="event-hero">
            <a routerLink="/events" class="back-link">
              <svg lucideArrowLeft class="back-link__icon" aria-hidden="true"></svg>
              Voltar
            </a>
            
            <div class="event-hero__main">
              <div class="event-hero__title-group">
                <span class="badge" [class.badge--success]="event()!.status === 'draw_done'">
                  {{ event()!.status === 'pending' ? 'Sorteio Pendente' : 'Sorteio Realizado' }}
                </span>
                <h1 class="event-hero__title">{{ event()!.name }}</h1>
              </div>
              <a [routerLink]="['/events', event()!.id, 'edit']" class="btn btn--icon">
                <svg lucideSettings class="btn__icon" aria-hidden="true"></svg>
              </a>
            </div>

            <div class="event-hero__details">
              <div class="detail-item">
                <svg lucideCalendarDays class="detail-icon" aria-hidden="true"></svg>
                <span>{{ event()!.date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="detail-item">
                <svg lucideMapPin class="detail-icon" aria-hidden="true"></svg>
                <span>{{ event()!.location }}</span>
              </div>
              <div class="detail-item">
                <svg lucideDollarSign class="detail-icon" aria-hidden="true"></svg>
                <span>{{ event()!.suggested_gift_value | currency:'BRL' }}</span>
              </div>
            </div>
            
            <p class="event-hero__subtitle">
              Gerencie os participantes e prepare-se para o sorteio secreto.
            </p>
          </header>

          @if (event()!.status === 'draw_done') {
            <div class="draw-done-banner">
              <h3>O sorteio já foi realizado!</h3>
              <a [routerLink]="['/events', event()!.id, 'results']" class="btn btn--primary">
                Ver Resultados
              </a>
            </div>
          } @else {
            <!-- Add Participant Section -->
            <section class="add-participant">
              <h2 class="section-title">Novo Participante</h2>
              <form class="add-participant__form" [formGroup]="participantForm" (ngSubmit)="onAddParticipant()">
                <div class="form-group-row">
                  <div class="form-field">
                    <input
                      type="text"
                      class="form-field__input"
                      formControlName="name"
                      placeholder="Nome do participante"
                    />
                  </div>
                  <div class="form-field">
                    <input
                      type="email"
                      class="form-field__input"
                      formControlName="email"
                      placeholder="E-mail"
                    />
                  </div>
                </div>
                <button type="submit" class="btn btn--secondary" [disabled]="participantForm.invalid || isAdding()">
                  <svg lucideUserPlus class="btn__icon" aria-hidden="true"></svg>
                  Adicionar
                </button>
              </form>
            </section>

            <!-- Participant List Section -->
            <section class="participant-list">
              <h2 class="section-title">Participantes ({{ participantService.participants().length }})</h2>
              
              @if (participantService.participants().length === 0) {
                <div class="empty-state">
                  Nenhum participante adicionado ainda.
                </div>
              } @else {
                <div class="participants-grid">
                  @for (p of participantService.participants(); track p.id) {
                    <div class="participant-card">
                      <div class="participant-card__avatar">
                        {{ p.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="participant-card__info">
                        <span class="participant-card__name">{{ p.name }}</span>
                        <span class="participant-card__email">{{ p.email }}</span>
                      </div>
                      <button class="btn btn--icon btn--danger" (click)="onRemoveParticipant(p.id)">
                        <svg lucideTrash2 class="btn__icon" aria-hidden="true"></svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </section>

            <!-- Fixed Action Bar -->
            <div class="fixed-action-bar">
              <button 
                class="btn btn--jewel" 
                [disabled]="participantService.participants().length < 3 || isDrawing()"
                (click)="onPerformDraw()"
              >
                @if (isDrawing()) {
                  <span class="btn__spinner"></span>
                } @else {
                  <svg lucideWand2 class="btn__icon" aria-hidden="true"></svg>
                  Disparar Sorteio
                }
              </button>
              @if (participantService.participants().length < 3) {
                <span class="help-text">Mínimo de 3 participantes</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .event-manage {
      position: relative;
      min-height: calc(100dvh - 133px);
      background-color: #0b1326;
      overflow: hidden;
      padding-bottom: 120px; /* space for FAB */
    }

    .event-manage__blur {
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

    .event-manage__content {
      position: relative;
      z-index: 1;
      padding: 32px 24px;
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
      background-color: rgba(148, 163, 184, 0.1);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: fit-content;
    }

    .badge--success {
      background-color: rgba(0, 165, 114, 0.1);
      color: #00a572;
    }

    .event-hero__details {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ccc3d7;
      font-size: 14px;
    }

    .detail-icon {
      width: 16px;
      height: 16px;
      stroke: #6d28d9;
    }

    .event-hero__subtitle {
      font-size: 16px;
      color: #94a3b8;
      margin: 0;
    }

    .draw-done-banner {
      background-color: rgba(0, 165, 114, 0.1);
      border: 1px solid rgba(0, 165, 114, 0.3);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }

    .draw-done-banner h3 {
      color: #00a572;
      margin: 0;
      font-size: 18px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #dae2fd;
      margin: 0 0 16px 0;
    }

    .add-participant {
      background-color: #131b2e;
      border: 1px solid rgba(74, 68, 85, 0.2);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .add-participant::before {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      top: -75px;
      right: -75px;
      background: rgba(109, 40, 217, 0.1);
      filter: blur(40px);
      border-radius: 50%;
    }

    .add-participant__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .form-group-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    @media (min-width: 480px) {
      .form-group-row {
        flex-direction: row;
      }
      .form-group-row .form-field {
        flex: 1;
      }
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field__input {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      background-color: #060e20;
      border: 1px solid rgba(74, 68, 85, 0.4);
      border-radius: 8px;
      color: #dae2fd;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-field__input:focus {
      border-color: #6d28d9;
    }

    .participant-list {
      display: flex;
      flex-direction: column;
    }

    .participants-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .participant-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: #060e20;
      border: 1px solid rgba(74, 68, 85, 0.15);
      border-radius: 8px;
      padding: 12px 16px;
    }

    .participant-card__avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .participant-card__info {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .participant-card__name {
      color: #dae2fd;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .participant-card__email {
      color: #94a3b8;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: #4a4455;
      font-size: 14px;
      background-color: #131b2e;
      border: 1px dashed rgba(74, 68, 85, 0.4);
      border-radius: 8px;
    }

    .fixed-action-bar {
      position: fixed;
      bottom: 80px; /* Above bottom nav */
      left: 0;
      right: 0;
      padding: 16px 24px;
      background: linear-gradient(to top, #0b1326 60%, transparent);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      z-index: 10;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.1s, opacity 0.2s;
    }

    .btn:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn--primary {
      height: 48px;
      padding: 0 24px;
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: #ffffff;
    }

    .btn--secondary {
      height: 48px;
      padding: 0 24px;
      background: rgba(109, 40, 217, 0.1);
      color: #dae2fd;
      border: 1px solid rgba(109, 40, 217, 0.3);
    }

    .btn--jewel {
      height: 56px;
      padding: 0 32px;
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: #ffffff;
      font-size: 16px;
      box-shadow: 0px 8px 32px rgba(83, 0, 183, 0.3);
      width: 100%;
      max-width: 340px;
    }

    .btn--icon {
      width: 40px;
      height: 40px;
      padding: 0;
      background: transparent;
      color: #94a3b8;
    }

    .btn--icon:hover {
      background: rgba(255,255,255,0.05);
    }

    .btn--danger {
      color: #f87171;
    }

    .btn--danger:hover {
      background: rgba(248, 113, 113, 0.1);
    }

    .btn__icon {
      width: 18px;
      height: 18px;
      stroke: currentColor;
    }

    .btn__spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .help-text {
      font-size: 12px;
      color: #94a3b8;
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
export class EventManageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  protected participantService = inject(ParticipantService);
  private drawService = inject(DrawService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected event = signal<Event | null>(null);
  protected isLoading = signal<boolean>(true);
  protected isAdding = signal<boolean>(false);
  protected isDrawing = signal<boolean>(false);

  protected participantForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    // Load Event
    this.eventService.getEventById(id).subscribe({
      next: (ev) => {
        this.event.set(ev);
        this.isLoading.set(false);
      },
      error: () => {
        this.router.navigate(['/events']);
      }
    });

    // Load Participants
    this.participantService.loadParticipants(id).subscribe();
  }

  protected onAddParticipant(): void {
    if (this.participantForm.invalid || !this.event()) return;

    this.isAdding.set(true);
    const { name, email } = this.participantForm.getRawValue();

    this.participantService.addParticipant(this.event()!.id, name, email).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.participantForm.reset();
      },
      error: () => {
        this.isAdding.set(false);
        alert('Erro ao adicionar participante');
      }
    });
  }

  protected onRemoveParticipant(id: string): void {
    if (confirm('Deseja realmente remover este participante?')) {
      this.participantService.removeParticipant(id).subscribe();
    }
  }

  protected onPerformDraw(): void {
    const ev = this.event();
    const participants = this.participantService.participants();

    if (!ev || participants.length < 3) return;

    this.isDrawing.set(true);
    this.drawService.performDraw(ev.id, participants).subscribe({
      next: () => {
        this.isDrawing.set(false);
        this.router.navigate(['/events', ev.id, 'results']);
      },
      error: (err) => {
        this.isDrawing.set(false);
        alert(err.message || 'Erro ao realizar o sorteio.');
      }
    });
  }
}
