import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucideCalendarDays, LucideMapPin, LucideDollarSign, LucideGift, LucideUserCheck } from '@lucide/angular';
import { PublicService } from './public.service';
import { Participant } from '../../core/models/participant.model';
import { Event } from '../../core/models/event.model';

import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-participant-access',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    LucideCalendarDays,
    LucideMapPin,
    LucideDollarSign,
    LucideGift,
    LucideUserCheck,
    HlmBadge,
    HlmButton,
    HlmInput,
    HlmLabel
  ],
  template: `
    <div class="relative min-h-dvh bg-background overflow-hidden flex flex-col">
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] -top-20 -left-20 bg-primary/15 blur-[80px]"></div>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
          <span class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          <p>Carregando convite...</p>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
          <p>{{ error() }}</p>
        </div>
      } @else if (participant() && event()) {
        <div class="relative z-10 max-w-md mx-auto px-6 py-12 flex flex-col gap-8 w-full">
          <!-- Section 1: Event Info -->
          <header class="flex flex-col items-center text-center gap-4">
            <span hlmBadge variant="outline" class="border-primary/30 text-foreground bg-primary/10">Convite Ativo</span>
            <h1 class="text-3xl font-extrabold text-foreground leading-tight m-0 tracking-tight">{{ event()!.name }}</h1>
            
            <div class="flex flex-col items-center gap-3 mt-2">
              <div class="flex items-center gap-2 text-muted-foreground text-sm">
                <svg lucideCalendarDays class="w-4.5 h-4.5 text-primary stroke-current" aria-hidden="true"></svg>
                <span>{{ event()!.date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="flex items-center gap-2 text-muted-foreground text-sm">
                <svg lucideMapPin class="w-4.5 h-4.5 text-primary stroke-current" aria-hidden="true"></svg>
                <span>{{ event()!.location }}</span>
              </div>
              <div class="flex items-center gap-2 text-muted-foreground text-sm">
                <svg lucideDollarSign class="w-4.5 h-4.5 text-primary stroke-current" aria-hidden="true"></svg>
                <span>{{ event()!.suggested_gift_value | currency:'BRL' }}</span>
              </div>
            </div>
          </header>

          @if (step() === 'auth') {
            <!-- Section 2: Authentication -->
            <section class="bg-card border border-border/80 rounded-2xl p-6 flex flex-col gap-5">
              <h2 class="text-xl font-bold text-foreground m-0 text-center tracking-tight">Confirme sua Identidade</h2>
              <p class="text-xs text-muted-foreground m-0 text-center leading-relaxed">Para acessar o sorteio, precisamos confirmar que é você mesmo(a).</p>

              <form [formGroup]="authForm" (ngSubmit)="onConfirmIdentity()" class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label hlmLabel for="auth-name">Seu Nome (como o organizador digitou)</label>
                  <input hlmInput id="auth-name" type="text" class="w-full" formControlName="name" placeholder="Ex: Ana Silva" />
                </div>
                <div class="flex flex-col gap-2">
                  <label hlmLabel for="auth-email">Seu E-mail</label>
                  <input hlmInput id="auth-email" type="email" class="w-full" formControlName="email" placeholder="Ex: ana@email.com" />
                </div>

                @if (authError()) {
                  <p class="text-xs text-destructive text-center m-0">{{ authError() }}</p>
                }

                <div class="flex flex-col gap-3 mt-2">
                  <button hlmBtn type="submit" variant="outline" class="w-full h-12 border-primary/20 bg-primary/10 hover:bg-primary/25 text-foreground" [disabled]="authForm.invalid || isVerifying()">
                    @if (isVerifying()) {
                      <span class="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></span>
                    } @else {
                      <svg lucideUserCheck class="w-5 h-5 mr-2" aria-hidden="true"></svg>
                      Confirmar Identidade
                    }
                  </button>
                </div>
              </form>
            </section>
          } @else if (step() === 'wishlist') {
            <!-- Section 3: Wishlist -->
            <section class="bg-card border border-border/80 rounded-2xl p-6 flex flex-col gap-5">
              <h2 class="text-xl font-bold text-foreground m-0 text-center tracking-tight">Sua Lista de Desejos</h2>
              <p class="text-xs text-muted-foreground m-0 text-center leading-relaxed">Dê 3 sugestões de presentes para ajudar quem tirar você!</p>

              <form [formGroup]="wishlistForm" (ngSubmit)="onSaveWishlist()" class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-3">
                  <span class="w-8 h-8 flex items-center justify-center bg-primary/25 text-foreground rounded-full font-bold text-sm shrink-0">1</span>
                  <input hlmInput type="text" class="w-full" formControlName="wish_1" placeholder="Sugestão de presente 1..." />
                </div>
                <div class="flex flex-row items-center gap-3">
                  <span class="w-8 h-8 flex items-center justify-center bg-primary/25 text-foreground rounded-full font-bold text-sm shrink-0">2</span>
                  <input hlmInput type="text" class="w-full" formControlName="wish_2" placeholder="Sugestão de presente 2..." />
                </div>
                <div class="flex flex-row items-center gap-3">
                  <span class="w-8 h-8 flex items-center justify-center bg-primary/25 text-foreground rounded-full font-bold text-sm shrink-0">3</span>
                  <input hlmInput type="text" class="w-full" formControlName="wish_3" placeholder="Sugestão de presente 3..." />
                </div>

                <button hlmBtn type="submit" class="w-full h-12 mt-4" [disabled]="wishlistForm.invalid || isSaving()">
                  @if (isSaving()) {
                    <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  } @else {
                    <svg lucideGift class="w-5 h-5 mr-2" aria-hidden="true"></svg>
                    Confirmar e Revelar Amigo
                  }
                </button>
                
                <p class="text-[10px] text-muted-foreground text-center mt-2 m-0">Ao participar, você concorda com as regras do grupo de amigo secreto.</p>
              </form>
            </section>
          }
        </div>
      }
    </div>
  `
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

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error.set('Link de acesso inválido.');
      this.isLoading.set(false);
      return;
    }

    try {
      const participant = await this.publicService.getParticipantByToken(this.token);
      if (!participant) {
        throw new Error('Convite não encontrado ou inválido.');
      }
      this.participant.set(participant);
      const event = await this.publicService.getEventById(participant.event_id.toString());
      this.event.set(event);
      
      // If already confirmed, redirect directly to reveal!
      if (this.participant()!.confirmed_at) {
        this.router.navigate(['/invite', this.token, 'reveal']);
      } else {
        this.isLoading.set(false);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Ocorreu um erro ao carregar o convite.');
      this.isLoading.set(false);
    }
  }

  protected async onConfirmIdentity(): Promise<void> {
    if (this.authForm.invalid) return;

    this.isVerifying.set(true);
    this.authError.set(null);
    const { name, email } = this.authForm.getRawValue();

    try {
      const isValid = await this.publicService.verifyIdentity(this.participant()!.id, name, email);
      this.isVerifying.set(false);
      if (isValid) {
        this.step.set('wishlist');
      } else {
        this.authError.set('Os dados não conferem com os cadastrados pelo organizador.');
      }
    } catch {
      this.isVerifying.set(false);
      this.authError.set('Erro ao verificar identidade. Tente novamente.');
    }
  }

  protected async onSaveWishlist(): Promise<void> {
    if (this.wishlistForm.invalid) return;

    this.isSaving.set(true);
    const wishes = this.wishlistForm.getRawValue();
    const participantId = this.participant()!.id;

    try {
      await Promise.all([
        this.publicService.saveWishlist(participantId, wishes),
        this.publicService.markParticipantConfirmed(participantId)
      ]);
      this.isSaving.set(false);
      this.router.navigate(['/invite', this.token, 'reveal']);
    } catch {
      this.isSaving.set(false);
      alert('Erro ao salvar lista de desejos. Tente novamente.');
    }
  }
}
