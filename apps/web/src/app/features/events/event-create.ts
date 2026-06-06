import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { EventService } from './event.service';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-event-create',
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
          <a routerLink="/events" class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground no-underline transition-colors w-fit">
            <svg lucideArrowLeft class="w-4 h-4" aria-hidden="true"></svg>
            Voltar
          </a>
          <h1 class="text-[44px] font-extrabold text-foreground leading-none m-0 tracking-tight">Novo Evento</h1>
          <p class="text-lg text-muted-foreground m-0">
            Crie um momento inesquecível para o seu grupo.
          </p>
        </header>

        <!-- Form -->
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

          @if (errorMessage) {
            <div class="text-xs text-destructive text-center">{{ errorMessage }}</div>
          }

          <div class="flex flex-col pt-4">
            <button
              hlmBtn
              type="submit"
              class="w-full"
              [disabled]="form.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                Criar Evento
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EventCreateComponent {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);

  protected isLoading = false;
  protected errorMessage = '';

  protected form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    suggested_gift_value: [0, [Validators.required, Validators.min(0)]]
  });

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const eventData = this.form.getRawValue();

    try {
      await this.eventService.createEvent(eventData);
      this.isLoading = false;
      this.router.navigate(['/events']);
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Erro ao criar evento. Tente novamente.';
    }
  }
}
