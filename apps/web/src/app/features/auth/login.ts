import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LucideGift, LucideShieldCheck } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LucideGift, LucideShieldCheck],
  template: `
    <div class="login-page">
      <!-- Decorative blurs -->
      <div class="login-page__blur login-page__blur--top"></div>
      <div class="login-page__blur login-page__blur--bottom"></div>

      <main class="login-page__card">
        <!-- Brand -->
        <div class="login-page__brand">
          <svg lucideGift class="login-page__brand-icon" aria-hidden="true"></svg>
          <h1 class="login-page__brand-title">Hidden Friend</h1>
          <p class="login-page__brand-subtitle">Bem-vindo ao Hidden Friend</p>
        </div>

        <!-- Form -->
        <form class="login-page__form" (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate>
          <div class="form-field">
            <label class="form-field__label" for="email">E-mail</label>
            <input
              id="email"
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
            <label class="form-field__label" for="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              class="form-field__input"
              placeholder="••••••••"
              required
              minlength="6"
              [(ngModel)]="password"
              #passwordRef="ngModel"
            />
            @if (passwordRef.invalid && passwordRef.touched) {
              <span class="form-field__error">Mínimo de 6 caracteres</span>
            }
          </div>

          @if (errorMessage) {
            <div class="form-field__error" style="text-align: center;">{{ errorMessage }}</div>
          }

          <div class="login-page__actions">
            <button
              type="submit"
              class="btn btn--primary"
              [disabled]="loginForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="btn__spinner"></span>
              } @else {
                Entrar
              }
            </button>

            <a routerLink="/auth/register" class="btn btn--ghost">
              Criar nova conta
            </a>
          </div>
        </form>

        <!-- Security badge -->
        <div class="login-page__badge">
          <svg lucideShieldCheck class="login-page__badge-icon" aria-hidden="true"></svg>
          <span>SUA PRIVACIDADE É NOSSA PRIORIDADE</span>
        </div>
      </main>
    </div>
  `,
  styles: `
    .login-page {
      position: relative;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0b1326;
      overflow: hidden;
      padding: 24px;
    }

    .login-page__blur {
      position: absolute;
      border-radius: 9999px;
      pointer-events: none;
    }

    .login-page__blur--top {
      width: 300px;
      height: 300px;
      top: -80px;
      right: -80px;
      background: rgba(109, 40, 217, 0.12);
      filter: blur(80px);
    }

    .login-page__blur--bottom {
      width: 200px;
      height: 200px;
      bottom: -40px;
      left: -40px;
      background: rgba(16, 185, 129, 0.08);
      filter: blur(64px);
    }

    .login-page__card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 390px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .login-page__brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .login-page__brand-icon {
      width: 48px;
      height: 48px;
      stroke: #6d28d9;
    }

    .login-page__brand-title {
      font-size: 32px;
      font-weight: 800;
      color: #dae2fd;
      text-align: center;
      margin: 0;
    }

    .login-page__brand-subtitle {
      font-size: 16px;
      color: #94a3b8;
      text-align: center;
      margin: 0;
    }

    .login-page__form {
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    .login-page__actions {
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

    .login-page__badge {
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

    .login-page__badge-icon {
      width: 14px;
      height: 14px;
      stroke: currentColor;
    }
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected email = '';
  protected password = '';
  protected isLoading = false;
  protected errorMessage = '';

  protected onSubmit(): void {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          this.router.navigate(['/events']);
        } else {
          this.errorMessage = 'E-mail ou senha incorretos.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao fazer login. Tente novamente.';
      }
    });
  }
}

