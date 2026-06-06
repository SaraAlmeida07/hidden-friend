import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LucideGift, LucideShieldCheck } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';

import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    LucideGift,
    LucideShieldCheck,
    HlmButton,
    HlmInput,
    HlmLabel
  ],
  template: `
    <div class="relative min-h-[100dvh] flex items-center justify-center bg-background overflow-hidden p-6">
      <!-- Decorative blurs -->
      <div class="absolute rounded-full pointer-events-none w-[300px] h-[300px] -top-20 -right-20 bg-primary/10 blur-[80px]"></div>
      <div class="absolute rounded-full pointer-events-none w-[200px] h-[200px] -bottom-10 -left-10 bg-emerald-500/10 blur-[64px]"></div>

      <main class="relative z-10 w-full max-w-[390px] flex flex-col gap-10">
        <!-- Brand -->
        <div class="flex flex-col items-center gap-3">
          <svg lucideGift class="w-12 h-12 stroke-primary" aria-hidden="true"></svg>
          <h1 class="text-3xl font-extrabold text-foreground text-center m-0">Hidden Friend</h1>
          <p class="text-base text-muted-foreground text-center m-0">Bem-vindo ao Hidden Friend</p>
        </div>

        <!-- Form -->
        <form class="flex flex-col gap-6" (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate>
          <div class="flex flex-col gap-2">
            <label hlmLabel for="email">E-mail</label>
            <input
              hlmInput
              id="email"
              name="email"
              type="email"
              class="w-full"
              placeholder="seu@email.com"
              required
              [(ngModel)]="email"
              #emailRef="ngModel"
            />
            @if (emailRef.invalid && emailRef.touched) {
              <span class="text-xs text-destructive">E-mail inválido</span>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label hlmLabel for="password">Senha</label>
            <input
              hlmInput
              id="password"
              name="password"
              type="password"
              class="w-full"
              placeholder="••••••••"
              required
              minlength="6"
              [(ngModel)]="password"
              #passwordRef="ngModel"
            />
            @if (passwordRef.invalid && passwordRef.touched) {
              <span class="text-xs text-destructive">Mínimo de 6 caracteres</span>
            }
          </div>

          @if (errorMessage) {
            <div class="text-xs text-destructive text-center">{{ errorMessage }}</div>
          }

          <div class="flex flex-col gap-3 pt-2">
            <button
              hlmBtn
              type="submit"
              class="w-full"
              [disabled]="loginForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                Entrar
              }
            </button>

            <a routerLink="/auth/register" hlmBtn variant="ghost" class="w-full text-muted-foreground hover:text-foreground">
              Criar nova conta
            </a>
          </div>
        </form>

        <!-- Security badge -->
        <div class="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-500 text-[11px] font-semibold tracking-wide">
          <svg lucideShieldCheck class="w-3.5 h-3.5 stroke-current" aria-hidden="true"></svg>
          <span>SUA PRIVACIDADE É NOSSA PRIORIDADE</span>
        </div>
      </main>
    </div>
  `
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

