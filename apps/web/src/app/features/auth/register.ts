import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LucideGift, LucideShieldCheck } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';

import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmLabelDirective } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    LucideGift,
    LucideShieldCheck,
    HlmButtonDirective,
    HlmInputDirective,
    HlmLabelDirective
  ],
  template: `
    <div class="relative min-h-[100dvh] flex items-center justify-center bg-background overflow-hidden p-6">
      <div class="absolute rounded-full pointer-events-none w-[300px] h-[300px] -top-20 -right-16 bg-primary/10 blur-[80px]"></div>
      <div class="absolute rounded-full pointer-events-none w-[200px] h-[200px] bottom-0 -left-10 bg-emerald-500/10 blur-[64px]"></div>

      <main class="relative z-10 w-full max-w-[390px] flex flex-col gap-8 py-6">
        <!-- Brand -->
        <div class="flex items-center gap-2.5">
          <svg lucideGift class="w-5 h-5 stroke-primary" aria-hidden="true"></svg>
          <span class="text-sm font-semibold text-muted-foreground">Hidden Friend</span>
        </div>

        <div class="flex flex-col gap-2">
          <h1 class="text-[44px] font-extrabold text-foreground leading-tight m-0">Crie sua conta</h1>
          <p class="text-lg text-muted-foreground leading-relaxed m-0">
            Junte-se ao Hidden Friend e comece a organizar seus sorteios.
          </p>
        </div>

        <!-- Form -->
        <form class="flex flex-col gap-5" (ngSubmit)="onSubmit()" #regForm="ngForm" novalidate>
          <div class="flex flex-col gap-2">
            <label hlmLabel for="fullName">Nome Completo</label>
            <input
              hlmInput
              id="fullName"
              name="fullName"
              type="text"
              class="w-full"
              placeholder="Seu nome completo"
              required
              [(ngModel)]="fullName"
              #nameRef="ngModel"
            />
            @if (nameRef.invalid && nameRef.touched) {
              <span class="text-xs text-destructive">Nome é obrigatório</span>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label hlmLabel for="regEmail">E-mail</label>
            <input
              hlmInput
              id="regEmail"
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
            <label hlmLabel for="regPassword">Senha</label>
            <input
              hlmInput
              id="regPassword"
              name="password"
              type="password"
              class="w-full"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
              [(ngModel)]="password"
              #passwordRef="ngModel"
            />
            @if (passwordRef.invalid && passwordRef.touched) {
              <span class="text-xs text-destructive">Mínimo de 8 caracteres</span>
            }
          </div>

          <div class="flex flex-col gap-2">
            <label hlmLabel for="confirmPassword">Confirmar Senha</label>
            <input
              hlmInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              class="w-full"
              placeholder="Repita a senha"
              required
              [(ngModel)]="confirmPassword"
              #confirmRef="ngModel"
            />
            @if (confirmRef.touched && password !== confirmPassword) {
              <span class="text-xs text-destructive">As senhas não coincidem</span>
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
              [disabled]="regForm.invalid || isLoading || password !== confirmPassword"
            >
              @if (isLoading) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                Criar Conta
              }
            </button>

            <a routerLink="/auth/login" hlmBtn variant="ghost" class="w-full text-muted-foreground hover:text-foreground">
              Já tenho uma conta
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

