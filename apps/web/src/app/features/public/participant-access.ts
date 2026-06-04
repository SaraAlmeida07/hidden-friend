import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucideCalendarDays, LucideMapPin, LucideDollarSign, LucideGift, LucideUserCheck } from '@lucide/angular';
import { PublicService } from './public.service';
import { Participant } from '../../core/models/participant.model';
import { Event } from '../../core/models/event.model';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-participant-access',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, LucideCalendarDays, LucideMapPin, LucideDollarSign, LucideGift, LucideUserCheck],
  template: `
    <div class="public-access">
      <div class="public-access__blur"></div>

      @if (isLoading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando convite...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
        </div>
      } @else if (participant() && event()) {
        <div class="public-access__content">
          <!-- Section 1: Event Info -->
          <header class="event-info">
            <span class="badge badge--active">Convite Ativo</span>
            <h1 class="event-info__title">{{ event()!.name }}</h1>
            
            <div class="event-info__details">
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
          </header>

          @if (step() === 'auth') {
            <!-- Section 2: Authentication -->
            <section class="auth-card">
              <h2 class="auth-card__title">Confirme sua Identidade</h2>
              <p class="auth-card__subtitle">Para acessar o sorteio, precisamos confirmar que é você mesmo(a).</p>

              <form [formGroup]="authForm" (ngSubmit)="onConfirmIdentity()" class="auth-card__form">
                <div class="form-field">
                  <label>Seu Nome (como o organizador digitou)</label>
                  <input type="text" class="form-field__input" formControlName="name" placeholder="Ex: Ana Silva" />
                </div>
                <div class="form-field">
                  <label>Seu E-mail</label>
                  <input type="email" class="form-field__input" formControlName="email" placeholder="Ex: ana@email.com" />
                </div>

                @if (authError()) {
                  <p class="error-text">{{ authError() }}</p>
                }

                <div class="auth-card__actions">
                  <button type="submit" class="btn btn--primary" [disabled]="authForm.invalid || isVerifying()">
                    @if (isVerifying()) {
                      <span class="btn__spinner"></span>
                    } @else {
                      <svg lucideUserCheck class="btn__icon" aria-hidden="true"></svg>
                      Confirmar Identidade
                    }
                  </button>
                </div>
              </form>
            </section>
          } @else if (step() === 'wishlist') {
            <!-- Section 3: Wishlist -->
            <section class="wishlist-card">
              <h2 class="wishlist-card__title">Sua Lista de Desejos</h2>
              <p class="wishlist-card__subtitle">Dê 3 sugestões de presentes para ajudar quem tirar você!</p>

              <form [formGroup]="wishlistForm" (ngSubmit)="onSaveWishlist()" class="wishlist-card__form">
                <div class="form-field form-field--numbered">
                  <span class="number-badge">1</span>
                  <input type="text" class="form-field__input" formControlName="wish_1" placeholder="Sugestão de presente 1..." />
                </div>
                <div class="form-field form-field--numbered">
                  <span class="number-badge">2</span>
                  <input type="text" class="form-field__input" formControlName="wish_2" placeholder="Sugestão de presente 2..." />
                </div>
                <div class="form-field form-field--numbered">
                  <span class="number-badge">3</span>
                  <input type="text" class="form-field__input" formControlName="wish_3" placeholder="Sugestão de presente 3..." />
                </div>

                <button type="submit" class="btn btn--jewel" [disabled]="wishlistForm.invalid || isSaving()">
                  @if (isSaving()) {
                    <span class="btn__spinner"></span>
                  } @else {
                    <svg lucideGift class="btn__icon" aria-hidden="true"></svg>
                    Confirmar e Revelar Amigo
                  }
                </button>
                
                <p class="footer-text">Ao participar, você concorda com as regras do grupo de amigo secreto.</p>
              </form>
            </section>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .public-access {
      position: relative;
      min-height: 100dvh;
      background-color: #0b1326;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .public-access__blur {
      position: absolute;
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
      background: rgba(109, 40, 217, 0.15);
      filter: blur(80px);
      border-radius: 50%;
      pointer-events: none;
    }

    .public-access__content {
      position: relative;
      z-index: 1;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
    }

    .event-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
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
    }

    .badge--active {
      background-color: rgba(109, 40, 217, 0.15);
      border: 1px solid rgba(109, 40, 217, 0.3);
      color: #dae2fd;
    }

    .event-info__title {
      font-size: 32px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 1.2;
      margin: 0;
    }

    .event-info__details {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ccc3d7;
      font-size: 15px;
    }

    .detail-icon {
      width: 18px;
      height: 18px;
      stroke: #6d28d9;
    }

    .auth-card, .wishlist-card {
      background-color: #131b2e;
      border: 1px solid rgba(74, 68, 85, 0.3);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .auth-card__title, .wishlist-card__title {
      font-size: 22px;
      font-weight: 700;
      color: #dae2fd;
      margin: 0;
      text-align: center;
    }

    .auth-card__subtitle, .wishlist-card__subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      text-align: center;
      line-height: 1.5;
    }

    .auth-card__form, .wishlist-card__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-field label {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }

    .form-field__input {
      width: 100%;
      height: 52px;
      padding: 0 16px;
      background-color: #060e20;
      border: 1px solid rgba(74, 68, 85, 0.4);
      border-radius: 8px;
      color: #dae2fd;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-field__input:focus {
      border-color: #6d28d9;
    }

    .form-field--numbered {
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .number-badge {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(109, 40, 217, 0.2);
      color: #dae2fd;
      border-radius: 50%;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .auth-card__actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
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
      font-size: 15px;
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
      height: 52px;
      width: 100%;
      background: rgba(109, 40, 217, 0.2);
      color: #dae2fd;
      border: 1px solid rgba(109, 40, 217, 0.4);
    }

    .btn--jewel {
      height: 56px;
      width: 100%;
      margin-top: 16px;
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: #ffffff;
      font-size: 16px;
      box-shadow: 0px 8px 32px rgba(83, 0, 183, 0.3);
    }

    .btn__icon {
      width: 20px;
      height: 20px;
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

    .error-text {
      color: #f87171;
      font-size: 13px;
      text-align: center;
      margin: 0;
    }

    .footer-text {
      font-size: 12px;
      color: #4a4455;
      text-align: center;
      margin: 8px 0 0 0;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 16px;
      color: #94a3b8;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(109, 40, 217, 0.3);
      border-top-color: #6d28d9;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
})
export class ParticipantAccessComponent implements OnInit {
  private publicService = inject(PublicService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  protected isLoading = signal<boolean>(true);
  protected isVerifying = signal<boolean>(false);
  protected isSaving = signal<boolean>(false);
  protected error = signal<string | null>(null);
  protected authError = signal<string | null>(null);
  
  protected participant = signal<Participant | null>(null);
  protected event = signal<Event | null>(null);
  protected step = signal<'auth' | 'wishlist'>('auth');
  
  private token = '';

  protected authForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  protected wishlistForm = this.fb.nonNullable.group({
    wish_1: ['', Validators.required],
    wish_2: [''],
    wish_3: ['']
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error.set('Link de acesso inválido.');
      this.isLoading.set(false);
      return;
    }

    this.publicService.getParticipantByToken(this.token).pipe(
      switchMap((participant: Participant | null) => {
        if (!participant) {
          throw new Error('Convite não encontrado ou inválido.');
        }
        this.participant.set(participant);
        return this.publicService.getEventById(participant.event_id.toString());
      })
    ).subscribe({
      next: (event: Event) => {
        this.event.set(event);
        
        // If already confirmed, redirect directly to reveal!
        if (this.participant()!.confirmed_at) {
          this.router.navigate(['/invite', this.token, 'reveal']);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.message || 'Ocorreu um erro ao carregar o convite.');
        this.isLoading.set(false);
      }
    });
  }

  protected onConfirmIdentity(): void {
    if (this.authForm.invalid) return;

    this.isVerifying.set(true);
    this.authError.set(null);
    const { name, email } = this.authForm.getRawValue();

    this.publicService.verifyIdentity(this.participant()!.id, name, email).subscribe({
      next: (isValid) => {
        this.isVerifying.set(false);
        if (isValid) {
          this.step.set('wishlist');
        } else {
          this.authError.set('Os dados não conferem com os cadastrados pelo organizador.');
        }
      },
      error: () => {
        this.isVerifying.set(false);
        this.authError.set('Erro ao verificar identidade. Tente novamente.');
      }
    });
  }

  protected onSaveWishlist(): void {
    if (this.wishlistForm.invalid) return;

    this.isSaving.set(true);
    const wishes = this.wishlistForm.getRawValue();
    const participantId = this.participant()!.id;

    forkJoin([
      this.publicService.saveWishlist(participantId, wishes),
      this.publicService.markParticipantConfirmed(participantId)
    ]).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/invite', this.token, 'reveal']);
      },
      error: () => {
        this.isSaving.set(false);
        alert('Erro ao salvar lista de desejos. Tente novamente.');
      }
    });
  }
}
