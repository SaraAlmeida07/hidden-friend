import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideGift } from '@lucide/angular';

import { PublicService } from './public.service';
import { Participant } from '../../core/models/participant.model';
import { Wishlist } from '../../core/models/wishlist.model';

@Component({
  selector: 'app-draw-reveal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideGift],
  template: `
    <div class="relative min-h-dvh bg-background overflow-hidden flex flex-col">
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/20 blur-[100px]"></div>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
          <span class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          <p>Preparando a revelação...</p>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
          <p>{{ error() }}</p>
        </div>
      } @else if (revealData()) {
        <div class="relative z-10 max-w-md mx-auto px-6 py-12 flex flex-col items-center gap-10 w-full">
          <header class="text-center flex flex-col gap-3">
            <h1 class="text-3xl font-extrabold text-foreground leading-tight m-0 tracking-tight">A grande revelação!</h1>
            <p class="text-base text-muted-foreground leading-relaxed m-0">Chegou a hora de descobrir quem você tirou neste amigo secreto.</p>
          </header>

          <!-- Reveal Card with Flip Animation -->
          <div class="reveal-card-container" [class.is-revealed]="isRevealed()" (click)="reveal()">
            <div class="reveal-card">
              <!-- Front of card (hidden state) -->
              <div class="reveal-card__face reveal-card__face--front">
                <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_2px,transparent_2px)] bg-[size:24px_24px] opacity-50"></div>
                <svg lucideGift class="w-16 h-16 stroke-white stroke-[1.5] reveal-card__icon" aria-hidden="true"></svg>
                <span class="text-lg font-semibold tracking-wider uppercase z-10">Toque para revelar</span>
              </div>
              
              <!-- Back of card (revealed state) -->
              <div class="reveal-card__face reveal-card__face--back bg-card border-2 border-primary gap-4 p-8 text-center">
                <p class="text-xs text-muted-foreground font-semibold tracking-widest uppercase m-0 z-10 relative">Você tirou:</p>
                <h2 class="text-3xl font-extrabold text-foreground leading-tight m-0 z-10 relative">{{ revealData()!.receiver.name }}</h2>
              </div>
            </div>
          </div>

          <!-- Wishlist Section (only shows after reveal) -->
          <div class="wishlist-section" [class.is-visible]="isRevealed()">
            <h3 class="text-lg font-bold text-foreground mb-4 text-center">Lista de Desejos</h3>
            
            @if (revealData()!.wishlist) {
              <div class="flex flex-col gap-3">
                @if (revealData()!.wishlist?.wish_1) {
                  <div class="flex items-center gap-4 bg-card border border-border p-4 rounded-xl">
                    <span class="w-7 h-7 flex items-center justify-center bg-primary/20 text-foreground rounded-full font-bold text-xs shrink-0">1</span>
                    <span class="text-sm font-medium text-foreground">{{ revealData()!.wishlist?.wish_1 }}</span>
                  </div>
                }
                @if (revealData()!.wishlist?.wish_2) {
                  <div class="flex items-center gap-4 bg-card border border-border p-4 rounded-xl">
                    <span class="w-7 h-7 flex items-center justify-center bg-primary/20 text-foreground rounded-full font-bold text-xs shrink-0">2</span>
                    <span class="text-sm font-medium text-foreground">{{ revealData()!.wishlist?.wish_2 }}</span>
                  </div>
                }
                @if (revealData()!.wishlist?.wish_3) {
                  <div class="flex items-center gap-4 bg-card border border-border p-4 rounded-xl">
                    <span class="w-7 h-7 flex items-center justify-center bg-primary/20 text-foreground rounded-full font-bold text-xs shrink-0">3</span>
                    <span class="text-sm font-medium text-foreground">{{ revealData()!.wishlist?.wish_3 }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="bg-card border border-dashed border-border p-6 rounded-xl text-muted-foreground text-center text-sm">
                Esta pessoa ainda não cadastrou nenhuma sugestão de presente.
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
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

    .reveal-card__icon {
      animation: float 3s ease-in-out infinite;
    }

    .reveal-card__face--back {
      transform: rotateY(180deg);
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

    .wishlist-section {
      width: 100%;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease 0.5s;
      pointer-events: none;
    }

    .wishlist-section.is-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
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

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error.set('Link de acesso inválido.');
      this.isLoading.set(false);
      return;
    }

    try {
      const participant = await this.publicService.getParticipantByToken(token);
      if (!participant) {
        throw new Error('Convite não encontrado ou inválido.');
      }
      if (!participant.confirmed_at) {
        // Se acessar a rota de reveal mas ainda não confirmou identidade, redireciona de volta
        this.router.navigate(['/invite', token]);
        throw new Error('Você precisa confirmar sua identidade primeiro.');
      }
      const data = await this.publicService.getDrawReveal(participant.id);
      if (!data) {
        this.error.set('O sorteio ainda não foi realizado ou não encontramos seu par.');
      } else {
        this.revealData.set(data);
      }
      this.isLoading.set(false);
    } catch (err: any) {
      if (!this.error()) {
        this.error.set(err.message || 'Ocorreu um erro ao carregar a revelação.');
      }
      this.isLoading.set(false);
    }
  }

  protected reveal(): void {
    if (!this.isRevealed()) {
      this.isRevealed.set(true);
    }
  }
}
