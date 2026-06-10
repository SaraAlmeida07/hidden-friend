import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { EventService } from './event.service';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, HlmInput, HlmLabel, HlmButton],
  template: `
    <div class="relative min-h-[calc(100dvh-133px)] bg-background overflow-hidden">
      <!-- Decorative blur -->
      <div class="absolute rounded-full pointer-events-none w-[400px] h-[400px] -top-20 -right-20 bg-primary/10 blur-[80px]"></div>

      <div class="relative z-10 max-w-xl mx-auto px-6 py-12 flex flex-col gap-10">
        <!-- Header -->
        <header class="flex flex-col gap-4">
          <a [routerLink]="['/events', eventId(), 'manage']" class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground no-underline transition-colors w-fit">
            <svg lucideArrowLeft class="w-4 h-4" aria-hidden="true"></svg>
            Voltar
          </a>
          <h1 class="text-[44px] font-extrabold text-foreground leading-none m-0 tracking-tight">Configurações do Evento</h1>
          <p class="text-lg text-muted-foreground m-0">
            Ajuste as regras do seu amigo secreto.
          </p>
        </header>

        <!-- Form -->
        @if (isLoadingData()) {
          <div class="flex flex-col items-center gap-4 py-16 text-muted-foreground">
            <span class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            <p>Carregando dados do evento...</p>
          </div>
        } @else {
          <form class="flex flex-col gap-6" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="flex flex-col gap-2">
              <label hlmLabel for="name">Nome do Evento</label>
              <input
                hlmInput
                id="name"
                type="text"
                class="w-full"
                formControlName="name"
                placeholder="Ex: Amigo Secreto da Família"
              />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <span class="text-xs text-destructive">Nome é obrigatório.</span>
              }
            </div>

            <div class="flex flex-col sm:flex-row gap-6">
              <div class="flex flex-col gap-2 flex-1">
                <label hlmLabel for="date">Data da Revelação</label>
                <input
                  hlmInput
                  id="date"
                  type="date"
                  class="w-full"
                  formControlName="date"
                />
                @if (form.get('date')?.invalid && form.get('date')?.touched) {
                  <span class="text-xs text-destructive">Data inválida.</span>
                }
              </div>

              <div class="flex flex-col gap-2 flex-1">
                <label hlmLabel for="location">Local da Troca</label>
                <input
                  hlmInput
                  id="location"
                  type="text"
                  class="w-full"
                  formControlName="location"
                  placeholder="Ex: Casa da Vó"
                />
                @if (form.get('location')?.invalid && form.get('location')?.touched) {
                  <span class="text-xs text-destructive">Local é obrigatório.</span>
                }
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label hlmLabel for="suggestedValue">Valor Sugerido (R$)</label>
              <input
                hlmInput
                id="suggestedValue"
                type="number"
                class="w-full"
                formControlName="suggested_gift_value"
                placeholder="Ex: 50.00"
                min="0"
                step="0.01"
              />
              @if (form.get('suggested_gift_value')?.invalid && form.get('suggested_gift_value')?.touched) {
                <span class="text-xs text-destructive">Valor inválido.</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="text-xs text-destructive text-center">{{ errorMessage() }}</div>
            }

            <div class="flex flex-col gap-3 pt-4">
              <button
                hlmBtn
                type="submit"
                class="w-full"
                [disabled]="form.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                } @else {
                  Salvar Alterações
                }
              </button>

              <button
                hlmBtn
                variant="outline"
                type="button"
                class="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                [disabled]="isSaving()"
                (click)="onDelete()"
              >
                Excluir Evento
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class EventEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected eventId = signal<string>('');
  protected isLoadingData = signal<boolean>(true);
  protected isSaving = signal<boolean>(false);
  protected errorMessage = signal<string>('');

  protected form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    suggested_gift_value: [0, [Validators.required, Validators.min(0)]]
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    this.eventId.set(id);
    try {
      const event = await this.eventService.getEventById(id);
      this.form.patchValue({
        name: event.name,
        date: event.date,
        location: event.location,
        suggested_gift_value: event.suggested_gift_value
      });
      this.isLoadingData.set(false);
    } catch {
      this.isLoadingData.set(false);
      this.errorMessage.set('Erro ao carregar os dados do evento.');
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const eventData = this.form.getRawValue();

    try {
      await this.eventService.updateEvent(this.eventId(), eventData);
      this.isSaving.set(false);
      this.router.navigate(['/events', this.eventId(), 'manage']);
    } catch {
      this.isSaving.set(false);
      this.errorMessage.set('Erro ao atualizar evento. Tente novamente.');
    }
  }

  protected async onDelete(): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    this.isSaving.set(true);
    try {
      await this.eventService.deleteEvent(this.eventId());
      this.isSaving.set(false);
      this.router.navigate(['/events']);
    } catch {
      this.isSaving.set(false);
      this.errorMessage.set('Erro ao excluir o evento.');
    }
  }
}
