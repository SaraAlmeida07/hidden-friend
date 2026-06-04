import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideGift } from '@lucide/angular';
import { switchMap } from 'rxjs';
import { PublicService } from './public.service';
import { Participant } from '../../core/models/participant.model';
import { Wishlist } from '../../core/models/wishlist.model';

@Component({
  selector: 'app-draw-reveal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideGift],
  template: `
    <div class="draw-reveal">
      <div class="draw-reveal__blur"></div>

      @if (isLoading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Preparando a revelação...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
        </div>
      } @else if (revealData()) {
        <div class="draw-reveal__content">
          <header class="reveal-header">
            <h1 class="reveal-header__title">A grande revelação!</h1>
            <p class="reveal-header__subtitle">Chegou a hora de descobrir quem você tirou neste amigo secreto.</p>
          </header>

          <!-- Reveal Card with Flip Animation -->
          <div class="reveal-card-container" [class.is-revealed]="isRevealed()" (click)="reveal()">
            <div class="reveal-card">
              <!-- Front of card (hidden state) -->
              <div class="reveal-card__face reveal-card__face--front">
                <div class="reveal-card__pattern"></div>
                <svg lucideGift class="reveal-card__icon" aria-hidden="true"></svg>
                <span>Toque para revelar</span>
              </div>
              
              <!-- Back of card (revealed state) -->
              <div class="reveal-card__face reveal-card__face--back">
                <p class="reveal-label">Você tirou:</p>
                <h2 class="reveal-name">{{ revealData()!.receiver.name }}</h2>
              </div>
            </div>
          </div>

          <!-- Wishlist Section (only shows after reveal) -->
          <div class="wishlist-section" [class.is-visible]="isRevealed()">
            <h3 class="wishlist-title">Lista de Desejos</h3>
            
            @if (revealData()!.wishlist) {
              <div class="wishlist-items">
                @if (revealData()!.wishlist?.wish_1) {
                  <div class="wishlist-item">
                    <span class="number-badge">1</span>
                    <span class="wish-text">{{ revealData()!.wishlist?.wish_1 }}</span>
                  </div>
                }
                @if (revealData()!.wishlist?.wish_2) {
                  <div class="wishlist-item">
                    <span class="number-badge">2</span>
                    <span class="wish-text">{{ revealData()!.wishlist?.wish_2 }}</span>
                  </div>
                }
                @if (revealData()!.wishlist?.wish_3) {
                  <div class="wishlist-item">
                    <span class="number-badge">3</span>
                    <span class="wish-text">{{ revealData()!.wishlist?.wish_3 }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                Esta pessoa ainda não cadastrou nenhuma sugestão de presente.
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .draw-reveal {
      position: relative;
      min-height: 100dvh;
      background-color: #0b1326;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .draw-reveal__blur {
      position: absolute;
      width: 400px;
      height: 400px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(109, 40, 217, 0.2);
      filter: blur(100px);
      border-radius: 50%;
      pointer-events: none;
    }

    .draw-reveal__content {
      position: relative;
      z-index: 1;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
    }

    .reveal-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .reveal-header__title {
      font-size: 32px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 1.2;
      margin: 0;
    }

    .reveal-header__subtitle {
      font-size: 16px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .reveal-card-container {
      width: 100%;
      max-width: 340px;
      height: 400px;
      perspective: 1000px;
      cursor: pointer;
    }

    .reveal-card {
      width: 100%;
      height: 100%;
      position: relative;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform-style: preserve-3d;
    }

    .reveal-card-container.is-revealed .reveal-card {
      transform: rotateY(180deg);
    }

    .reveal-card__face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }

    .reveal-card__face--front {
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: white;
      gap: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .reveal-card__pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px);
      background-size: 24px 24px;
      opacity: 0.5;
    }

    .reveal-card__icon {
      width: 64px;
      height: 64px;
      stroke: white;
      stroke-width: 1.5;
      animation: float 3s ease-in-out infinite;
    }

    .reveal-card__face--front span {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      z-index: 1;
    }

    .reveal-card__face--back {
      background: #131b2e;
      border: 2px solid #6d28d9;
      transform: rotateY(180deg);
      gap: 16px;
      padding: 32px;
      text-align: center;
    }

    .reveal-card__face--back::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      background: rgba(109, 40, 217, 0.3);
      filter: blur(50px);
      border-radius: 50%;
    }

    .reveal-label {
      font-size: 16px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0;
      position: relative;
      z-index: 1;
    }

    .reveal-name {
      font-size: 36px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 1.1;
      margin: 0;
      position: relative;
      z-index: 1;
    }

    .wishlist-section {
      width: 100%;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease 0.5s; /* Delay to wait for flip */
      pointer-events: none;
    }

    .wishlist-section.is-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .wishlist-title {
      font-size: 20px;
      font-weight: 700;
      color: #dae2fd;
      margin: 0 0 16px 0;
      text-align: center;
    }

    .wishlist-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .wishlist-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background-color: #131b2e;
      border: 1px solid rgba(74, 68, 85, 0.3);
      padding: 16px;
      border-radius: 12px;
    }

    .number-badge {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(109, 40, 217, 0.2);
      color: #dae2fd;
      border-radius: 50%;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }

    .wish-text {
      color: #dae2fd;
      font-size: 15px;
      font-weight: 500;
    }

    .empty-state {
      background-color: #131b2e;
      border: 1px dashed rgba(74, 68, 85, 0.4);
      padding: 24px;
      border-radius: 12px;
      color: #94a3b8;
      text-align: center;
      font-size: 14px;
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

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
})
export class DrawRevealComponent implements OnInit {
  private publicService = inject(PublicService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected isLoading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected isRevealed = signal<boolean>(false);
  
  protected revealData = signal<{ receiver: Participant, wishlist: Wishlist | null } | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error.set('Link de acesso inválido.');
      this.isLoading.set(false);
      return;
    }

    this.publicService.getParticipantByToken(token).pipe(
      switchMap((participant: Participant | null) => {
        if (!participant) {
          throw new Error('Convite não encontrado ou inválido.');
        }
        if (!participant.confirmed_at) {
          // Se acessar a rota de reveal mas ainda não confirmou identidade, redireciona de volta
          this.router.navigate(['/invite', token]);
          throw new Error('Você precisa confirmar sua identidade primeiro.');
        }
        return this.publicService.getDrawReveal(participant.id);
      })
    ).subscribe({
      next: (data) => {
        if (!data) {
          this.error.set('O sorteio ainda não foi realizado ou não encontramos seu par.');
        } else {
          this.revealData.set(data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        if (!this.error()) {
          this.error.set(err.message || 'Ocorreu um erro ao carregar a revelação.');
        }
        this.isLoading.set(false);
      }
    });
  }

  protected reveal(): void {
    if (!this.isRevealed()) {
      this.isRevealed.set(true);
    }
  }
}
