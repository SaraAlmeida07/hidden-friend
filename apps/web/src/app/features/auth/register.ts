import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LucideGift, LucideShieldCheck } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LucideGift, LucideShieldCheck],
  template: `
    <div class="register-page">
      <div class="register-page__blur register-page__blur--top"></div>
      <div class="register-page__blur register-page__blur--bottom"></div>

      <main class="register-page__card">
        <!-- Brand -->
        <div class="register-page__brand">
          <svg lucideGift class="register-page__brand-icon" aria-hidden="true"></svg>
          <span class="register-page__brand-label">Hidden Friend</span>
        </div>

        <div class="register-page__header">
          <h1 class="register-page__title">Crie sua conta</h1>
          <p class="register-page__subtitle">
            Junte-se ao Hidden Friend e comece a organizar seus sorteios.
          </p>
        </div>

        <!-- Form -->
        <form class="register-page__form" (ngSubmit)="onSubmit()" #regForm="ngForm" novalidate>
          <div class="form-field">
            <label class="form-field__label" for="fullName">Nome Completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              class="form-field__input"
              placeholder="Seu nome completo"
              required
              [(ngModel)]="fullName"
              #nameRef="ngModel"
            />
            @if (nameRef.invalid && nameRef.touched) {
              <span class="form-field__error">Nome é obrigatório</span>
            }
          </div>

          <div class="form-field">
            <label class="form-field__label" for="regEmail">E-mail</label>
            <input
              id="regEmail"
              name="email"
              type="email"
              class="form-field__input"
              placeholder="seu@email.com"
              required
              [(ngModel)]="email"
              #emailRef="ngModel"
            />
            @if (emailRef.invalid && emailRef.touched) {
              <span class="form-field__error">E-mail inválido</span>
            }
          </div>

          <div class="form-field">
            <label class="form-field__label" for="regPassword">Senha</label>
            <input
              id="regPassword"
              name="password"
              type="password"
              class="form-field__input"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
              [(ngModel)]="password"
              #passwordRef="ngModel"
            />
            @if (passwordRef.invalid && passwordRef.touched) {
              <span class="form-field__error">Mínimo de 8 caracteres</span>
            }
          </div>

          <div class="form-field">
            <label class="form-field__label" for="confirmPassword">Confirmar Senha</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              class="form-field__input"
              placeholder="Repita a senha"
              required
              [(ngModel)]="confirmPassword"
              #confirmRef="ngModel"
            />
            @if (confirmRef.touched && password !== confirmPassword) {
              <span class="form-field__error">As senhas não coincidem</span>
            }
          </div>

          @if (errorMessage) {
            <div class="form-field__error" style="text-align: center;">{{ errorMessage }}</div>
          }

          <div class="register-page__actions">
            <button
              type="submit"
              class="btn btn--primary"
              [disabled]="regForm.invalid || isLoading || password !== confirmPassword"
            >
              @if (isLoading) {
                <span class="btn__spinner"></span>
              } @else {
                Criar Conta
              }
            </button>

            <a routerLink="/auth/login" class="btn btn--ghost">
              Já tenho uma conta
            </a>
          </div>
        </form>

        <!-- Security badge -->
        <div class="register-page__badge">
          <svg lucideShieldCheck class="register-page__badge-icon" aria-hidden="true"></svg>
          <span>SUA PRIVACIDADE É NOSSA PRIORIDADE</span>
        </div>
      </main>
    </div>
  `,
  styles: `
    .register-page {
      position: relative;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0b1326;
      overflow: hidden;
      padding: 24px;
    }

    .register-page__blur {
      position: absolute;
      border-radius: 9999px;
      pointer-events: none;
    }

    .register-page__blur--top {
      width: 300px;
      height: 300px;
      top: -80px;
      right: -60px;
      background: rgba(109, 40, 217, 0.12);
      filter: blur(80px);
    }

    .register-page__blur--bottom {
      width: 200px;
      height: 200px;
      bottom: 0;
      left: -40px;
      background: rgba(16, 185, 129, 0.08);
      filter: blur(64px);
    }

    .register-page__card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 390px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 24px 0;
    }

    .register-page__brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .register-page__brand-icon {
      width: 20px;
      height: 20px;
      stroke: #6d28d9;
    }

    .register-page__brand-label {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
    }

    .register-page__header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .register-page__title {
      font-size: 44px;
      font-weight: 800;
      color: #dae2fd;
      line-height: 55px;
      margin: 0;
    }

    .register-page__subtitle {
      font-size: 18px;
      color: #ccc3d7;
      line-height: 29px;
      margin: 0;
    }

    .register-page__form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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

    .register-page__actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 8px;
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
      transition: opacity 0.2s, transform 0.1s;
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

    .btn--ghost {
      background: transparent;
      color: #94a3b8;
      font-weight: 500;
    }

    .btn--ghost:hover {
      color: #dae2fd;
    }

    .btn__spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 9999px;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .register-page__badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 20px;
      background-color: rgba(0, 165, 114, 0.1);
      border: 1px solid rgba(0, 165, 114, 0.3);
      border-radius: 9999px;
      color: #00a572;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .register-page__badge-icon {
      width: 14px;
      height: 14px;
      stroke: currentColor;
    }
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected fullName = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected isLoading = false;
  protected errorMessage = '';

  protected onSubmit(): void {
    if (this.password !== this.confirmPassword || !this.fullName || !this.email) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.fullName, this.email, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          this.router.navigate(['/events']);
        } else {
          this.errorMessage = 'Erro ao criar conta.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao criar conta. Tente novamente.';
      }
    });
  }
}

