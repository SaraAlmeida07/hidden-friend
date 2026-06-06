import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { LucideArrowLeft, LucideCheck, LucideCopy } from '@lucide/angular';
import { EventService } from './event.service';
import { ParticipantService } from '../participants/participant.service';
import { Event } from '../../core/models/event.model';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-event-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe, LucideArrowLeft, LucideCheck, LucideCopy, HlmBadge, HlmButton],
  template: `
    <div class="relative min-h-[calc(100dvh-133px)] bg-background overflow-hidden pb-16">
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] -top-20 -left-20 bg-emerald-500/10 blur-[80px]"></div>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center min-h-[50dvh] text-muted-foreground gap-4">
          <span class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          <p>Carregando resultados...</p>
        </div>
      } @else if (event()) {
        <div class="relative z-10 max-w-xl mx-auto px-6 py-8 flex flex-col gap-10">
          <header class="flex flex-col gap-4">
            <a routerLink="/events" class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground no-underline transition-colors w-fit">
              <svg lucideArrowLeft class="w-4 h-4" aria-hidden="true"></svg>
              Voltar ao Dashboard
            </a>
            
            <div class="flex justify-between items-start gap-4">
              <div class="flex flex-col gap-2.5">
                <span hlmBadge variant="default">Sorteio Realizado</span>
                <h1 class="text-3xl font-extrabold text-foreground leading-tight m-0 tracking-tight">{{ event()!.name }}</h1>
              </div>
            </div>

            <p class="text-base text-muted-foreground leading-relaxed m-0">
              O sorteio foi realizado! Agora compartilhe os links de acesso individuais com cada participante para que descubram quem tiraram.
            </p>
          </header>

          <section class="flex flex-col gap-4">
            <h2 class="text-lg font-bold text-foreground m-0">Links de Acesso ({{ participantService.participants().length }})</h2>
            
            <div class="flex flex-col gap-3">
              @for (p of participantService.participants(); track p.id) {
                <div class="flex items-center justify-between gap-4 bg-card border border-border/60 rounded-xl p-4">
                  <div class="flex flex-col flex-1 min-w-0">
                    <span class="text-sm font-semibold text-foreground truncate">{{ p.name }}</span>
                    <span class="text-xs text-muted-foreground truncate mb-1.5">{{ p.email }}</span>
                    <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">
                      Link: <span class="text-foreground font-normal">/invite/{{ p.token | slice:0:8 }}...</span>
                    </span>
                  </div>
                  
                  <button 
                    hlmBtn 
                    [variant]="copiedId() === p.id ? 'default' : 'outline'" 
                    size="sm"
                    [class]="copiedId() === p.id ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-500' : ''"
                    (click)="copyLink(p.id, p.token)"
                  >
                    @if (copiedId() === p.id) {
                      <svg lucideCheck class="w-4 h-4 mr-1.5" aria-hidden="true"></svg>
                      <span>Copiado!</span>
                    } @else {
                      <svg lucideCopy class="w-4 h-4 mr-1.5" aria-hidden="true"></svg>
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
  `
})
export class EventResultsComponent implements OnInit {
  private eventService = inject(EventService);
  protected participantService = inject(ParticipantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected event = signal<Event | null>(null);
  protected isLoading = signal<boolean>(true);
  protected copiedId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    try {
      const ev = await this.eventService.getEventById(id);
      if (ev.status !== 'draw_done') {
        this.router.navigate(['/events', id, 'manage']);
        return;
      }
      this.event.set(ev);
      this.isLoading.set(false);
    } catch {
      this.router.navigate(['/events']);
      return;
    }

    try {
      await this.participantService.loadParticipants(id);
    } catch (e) {
      console.error(e);
    }
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
