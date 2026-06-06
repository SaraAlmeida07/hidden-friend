import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucideArrowLeft, LucideCalendarDays, LucideMapPin, LucideDollarSign, LucideSettings, LucideUserPlus, LucideTrash2, LucideWand2 } from '@lucide/angular';
import { EventService } from './event.service';
import { ParticipantService } from '../participants/participant.service';
import { DrawService } from '../draw/draw.service';
import { Event } from '../../core/models/event.model';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

@Component({
  selector: 'app-event-manage',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    LucideArrowLeft,
    LucideCalendarDays,
    LucideMapPin,
    LucideDollarSign,
    LucideSettings,
    LucideUserPlus,
    LucideTrash2,
    LucideWand2,
    HlmBadge,
    HlmButton,
    HlmInput,
    ...HlmAvatarImports
  ],
  template: `
    <div class="relative min-h-[calc(100dvh-133px)] bg-background overflow-hidden pb-32">
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] -top-20 -right-20 bg-primary/10 blur-[80px]"></div>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center min-h-[50dvh] text-muted-foreground gap-4">
          <span class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          <p>Carregando evento...</p>
        </div>
      } @else if (event()) {
        <div class="relative z-10 max-w-xl mx-auto px-6 py-8 flex flex-col gap-10">
          <!-- Header/Hero -->
          <header class="flex flex-col gap-4">
            <a routerLink="/events" class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground no-underline transition-colors w-fit">
              <svg lucideArrowLeft class="w-4 h-4" aria-hidden="true"></svg>
              Voltar
            </a>
            
            <div class="flex justify-between items-start gap-4">
              <div class="flex flex-col gap-2.5">
                <span hlmBadge [variant]="event()!.status === 'draw_done' ? 'default' : 'secondary'">
                  {{ event()!.status === 'pending' ? 'Sorteio Pendente' : 'Sorteio Realizado' }}
                </span>
                <h1 class="text-3xl font-extrabold text-foreground leading-tight m-0 tracking-tight">{{ event()!.name }}</h1>
              </div>
              <a [routerLink]="['/events', event()!.id, 'edit']" hlmBtn variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground">
                <svg lucideSettings class="w-5 h-5" aria-hidden="true"></svg>
              </a>
            </div>

            <div class="flex flex-wrap gap-4 mt-2">
              <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <svg lucideCalendarDays class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
                <span>{{ event()!.date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <svg lucideMapPin class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
                <span>{{ event()!.location }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <svg lucideDollarSign class="w-4 h-4 text-primary stroke-current" aria-hidden="true"></svg>
                <span>{{ event()!.suggested_gift_value | currency:'BRL' }}</span>
              </div>
            </div>
          </header>

          @if (event()!.status === 'draw_done') {
            <div class="flex flex-col gap-4 items-center justify-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <h3 class="text-emerald-500 font-bold text-lg m-0">O sorteio já foi realizado!</h3>
              <a [routerLink]="['/events', event()!.id, 'results']" hlmBtn class="w-full sm:w-auto">
                Ver Resultados
              </a>
            </div>
          } @else {
            <!-- Add Participant Section -->
            <section class="flex flex-col gap-4 p-5 bg-card border border-border rounded-xl relative overflow-hidden">
              <div class="absolute rounded-full pointer-events-none w-32 h-32 -top-16 -right-16 bg-primary/10 blur-[32px]"></div>
              <h2 class="text-lg font-bold text-foreground m-0 relative z-10">Novo Participante</h2>
              <form class="flex flex-col gap-4 relative z-10" [formGroup]="participantForm" (ngSubmit)="onAddParticipant()">
                <div class="flex flex-col sm:flex-row gap-4">
                  <div class="flex-1">
                    <input
                      hlmInput
                      type="text"
                      class="w-full"
                      formControlName="name"
                      placeholder="Nome do participante"
                    />
                  </div>
                  <div class="flex-1">
                    <input
                      hlmInput
                      type="email"
                      class="w-full"
                      formControlName="email"
                      placeholder="E-mail"
                    />
                  </div>
                </div>
                <button hlmBtn type="submit" variant="secondary" class="w-full" [disabled]="participantForm.invalid || isAdding()">
                  <svg lucideUserPlus class="w-4 h-4 mr-2" aria-hidden="true"></svg>
                  Adicionar
                </button>
              </form>
            </section>

            <!-- Participant List Section -->
            <section class="flex flex-col gap-4">
              <h2 class="text-lg font-bold text-foreground m-0">Participantes ({{ participantService.participants().length }})</h2>
              
              @if (participantService.participants().length === 0) {
                <div class="text-center py-8 px-4 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
                  Nenhum participante adicionado ainda.
                </div>
              } @else {
                <div class="flex flex-col gap-3">
                  @for (p of participantService.participants(); track p.id) {
                    <div class="flex items-center gap-4 bg-card border border-border/60 rounded-xl p-4">
                      <hlm-avatar class="w-10 h-10">
                        <span hlmAvatarFallback class="bg-primary/20 text-primary font-bold">{{ p.name.charAt(0).toUpperCase() }}</span>
                      </hlm-avatar>
                      <div class="flex flex-col flex-1 min-w-0">
                        <span class="text-sm font-semibold text-foreground truncate">{{ p.name }}</span>
                        <span class="text-xs text-muted-foreground truncate">{{ p.email }}</span>
                      </div>
                      <button hlmBtn variant="ghost" size="icon" class="text-destructive hover:bg-destructive/10 hover:text-destructive" (click)="onRemoveParticipant(p.id)">
                        <svg lucideTrash2 class="w-4 h-4" aria-hidden="true"></svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </section>

            <!-- Action Bar -->
            <div class="flex flex-col items-center gap-2 mt-6">
              <button 
                hlmBtn 
                class="w-full"
                [disabled]="participantService.participants().length < 3 || isDrawing()"
                (click)="onPerformDraw()"
              >
                @if (isDrawing()) {
                  <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                } @else {
                  <svg lucideWand2 class="w-4 h-4 mr-2" aria-hidden="true"></svg>
                  Disparar Sorteio
                }
              </button>
              @if (participantService.participants().length < 3) {
                <span class="text-xs text-muted-foreground">Mínimo de 3 participantes</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `
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

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    // Load Event
    try {
      const ev = await this.eventService.getEventById(id);
      this.event.set(ev);
      this.isLoading.set(false);
    } catch {
      this.router.navigate(['/events']);
      return;
    }

    // Load Participants
    try {
      await this.participantService.loadParticipants(id);
    } catch (e) {
      console.error(e);
    }
  }

  protected async onAddParticipant(): Promise<void> {
    if (this.participantForm.invalid || !this.event()) return;

    this.isAdding.set(true);
    const { name, email } = this.participantForm.getRawValue();

    try {
      await this.participantService.addParticipant(this.event()!.id, name, email);
      this.isAdding.set(false);
      this.participantForm.reset();
    } catch {
      this.isAdding.set(false);
      alert('Erro ao adicionar participante');
    }
  }

  protected async onRemoveParticipant(id: string): Promise<void> {
    if (confirm('Deseja realmente remover este participante?')) {
      try {
        await this.participantService.removeParticipant(id);
      } catch (e) {
        console.error(e);
      }
    }
  }

  protected async onPerformDraw(): Promise<void> {
    const ev = this.event();
    const participants = this.participantService.participants();

    if (!ev || participants.length < 3) return;

    this.isDrawing.set(true);
    try {
      await this.drawService.performDraw(ev.id, participants);
      this.isDrawing.set(false);
      this.router.navigate(['/events', ev.id, 'results']);
    } catch (err: any) {
      this.isDrawing.set(false);
      alert(err.message || 'Erro ao realizar o sorteio.');
    }
  }
}
