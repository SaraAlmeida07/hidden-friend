import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideCalendarDays, LucideUserCircle } from '@lucide/angular';

@Component({
  selector: 'app-bottom-nav-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideCalendarDays, LucideUserCircle],
  template: `
    <nav class="bottom-nav">
      <a
        routerLink="/events"
        routerLinkActive="bottom-nav__link--active"
        class="bottom-nav__link"
        aria-label="Eventos"
      >
        <svg lucideCalendarDays class="bottom-nav__icon" aria-hidden="true"></svg>
        <span class="bottom-nav__label">Events</span>
      </a>

      <a
        routerLink="/profile"
        routerLinkActive="bottom-nav__link--active"
        class="bottom-nav__link"
        aria-label="Perfil"
      >
        <svg lucideUserCircle class="bottom-nav__icon" aria-hidden="true"></svg>
        <span class="bottom-nav__label">Profile</span>
      </a>
    </nav>
  `,
  styles: `
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      height: 73px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      background-color: rgba(2, 6, 23, 0.8);
      border-top: 1px solid rgba(204, 195, 215, 0.15);
      box-shadow: 0px -4px 32px 0px rgba(83, 0, 183, 0.06);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }

    .bottom-nav__link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 24px;
      text-decoration: none;
      color: #94a3b8;
      border-radius: 8px;
      transition: color 0.2s;
    }

    .bottom-nav__link--active {
      color: #6d28d9;
    }

    .bottom-nav__icon {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }

    .bottom-nav__label {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 500;
      line-height: 17px;
    }
  `,
})
export class BottomNavBarComponent {}
