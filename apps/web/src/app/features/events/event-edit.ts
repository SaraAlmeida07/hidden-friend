import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { EventService } from './event.service';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft],
  template: `
    <div class="event-edit">
      <div class="event-edit__blur"></div>

      <div class="event-edit__content">
        <!-- Header -->
        <header class="event-edit__header">
          <a [routerLink]="['/events', eventId(), 'manage']" class="back-link">
            <svg lucideArrowLeft class="back-link__icon" aria-hidden="true"></svg>
            Voltar
          </a>
          <h1 class="event-create__title">Configurações do Evento</h1>
          <p class="event-create__subtitle">
            Ajuste as regras do seu amigo secreto.
          </p>
        </header>

        <!-- Form -->
        @if (isLoadingData()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <p>Carregando dados do evento...</p>
          </div>
        } @else {
          <form class="event-form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <label class="form-field__label" for="name">Nome do Evento</label>
              <input
                id="name"
                type="text"
                class="form-field__input"
                formControlName="name"
                placeholder="Ex: Amigo Secreto da Família"
              />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <span class="form-field__error">Nome é obrigatório.</span>
              }
            </div>

            <div class="form-group-row">
              <div class="form-field">
                <label class="form-field__label" for="date">Data da Revelação</label>
                <input
                  id="date"
                  type="date"
                  class="form-field__input"
                  formControlName="date"
                />
                @if (form.get('date')?.invalid && form.get('date')?.touched) {
                  <span class="form-field__error">Data inválida.</span>
                }
              </div>

              <div class="form-field">
                <label class="form-field__label" for="location">Local da Troca</label>
                <input
                  id="location"
                  type="text"
                  class="form-field__input"
                  formControlName="location"
                  placeholder="Ex: Casa da Vó"
                />
                @if (form.get('location')?.invalid && form.get('location')?.touched) {
                  <span class="form-field__error">Local é obrigatório.</span>
                }
              </div>
            </div>

            <div class="form-field">
              <label class="form-field__label" for="suggestedValue">Valor Sugerido (R$)</label>
              <input
                id="suggestedValue"
                type="number"
                class="form-field__input"
                formControlName="suggested_gift_value"
                placeholder="Ex: 50.00"
                min="0"
                step="0.01"
              />
              @if (form.get('suggested_gift_value')?.invalid && form.get('suggested_gift_value')?.touched) {
                <span class="form-field__error">Valor inválido.</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="form-field__error" style="text-align: center;">{{ errorMessage() }}</div>
            }

            <div class="event-form__actions">
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="form.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <span class="btn__spinner"></span>
                } @else {
                  Salvar Alterações
                }
              </button>

              <button
                type="button"
                class="btn btn--danger"
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
  `,
  styles: `
    .event-edit {
      position: relative;
      min-height: calc(100dvh - 133px);
      background-color: #0b1326;
      overflow: hidden;
    }

    .event-edit__blur {
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

    .event-edit__content {
      position: relative;
      z-index: 1;
      padding: 32px 24px 48px;
      display: flex;
      flex-direction: column;
      gap: 40px;
      max-width: 600px;
      margin: 0 auto;
    }

    .event-edit__header {
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

    .event-create__title {
      font-size: 44px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 55px;
      margin: 0;
    }

    .event-create__subtitle {
      font-size: 18px;
      color: #ccc3d7;
      line-height: 29px;
      margin: 0;
    }

    .event-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group-row {
      display: flex;
      flex-direction: column;
      gap: 24px;
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
      gap: 8px;
    }

    .form-field__label {
      font-size: 14px;
      font-weight: 500;
      color: #ccc3d7;
    }

    .form-field__input {
      width: 100%;
      height: 52px;
      padding: 0 16px;
      background-color: #131b2e;
      border: 1px solid rgba(74, 68, 85, 0.4);
      border-radius: 8px;
      color: #dae2fd;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-field__input::placeholder {
      color: #4a4455;
    }

    .form-field__input:focus {
      border-color: #6d28d9;
    }

    .form-field__error {
      font-size: 12px;
      color: #f87171;
    }

    .event-form__actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 16px;
    }

    .btn {
      width: 100%;
      height: 56px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      transition: transform 0.1s, opacity 0.2s;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn--primary {
      background: linear-gradient(171deg, #5300b7 0%, #6d28d9 100%);
      color: #ffffff;
      box-shadow: 0px 8px 32px rgba(83, 0, 183, 0.2);
    }

    .btn--primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn--danger {
      background: transparent;
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.2);
    }

    .btn--danger:hover:not(:disabled) {
      background: rgba(248, 113, 113, 0.1);
    }

    .btn__spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    this.eventId.set(id);
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.form.patchValue({
          name: event.name,
          date: event.date,
          location: event.location,
          suggested_gift_value: event.suggested_gift_value
        });
        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
        this.errorMessage.set('Erro ao carregar os dados do evento.');
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const eventData = this.form.getRawValue();

    this.eventService.updateEvent(this.eventId(), eventData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/events', this.eventId(), 'manage']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Erro ao atualizar evento. Tente novamente.');
      }
    });
  }

  protected onDelete(): void {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    this.isSaving.set(true);
    this.eventService.deleteEvent(this.eventId()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/events']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Erro ao excluir o evento.');
      }
    });
  }
}
