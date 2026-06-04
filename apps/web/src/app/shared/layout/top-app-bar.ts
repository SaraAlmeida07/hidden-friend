import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideGift, LucideBell } from '@lucide/angular';

@Component({
  selector: 'app-top-app-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideGift, LucideBell],
  template: `
    <header class="top-app-bar">
      <div class="top-app-bar__inner">
        <a routerLink="/events" class="top-app-bar__brand">
          <svg lucideGift class="top-app-bar__logo-icon" aria-hidden="true"></svg>
          <span class="top-app-bar__title">Hidden Friend</span>
        </a>
        <button
          class="top-app-bar__action"
          aria-label="Notificações"
          title="Notificações"
        >
          <svg lucideBell aria-hidden="true"></svg>
        </button>
      </div>
    </header>
  `,
  styles: `
    .top-app-bar {
      position: sticky;
      top: 0;
      z-index: 50;
      width: 100%;
      height: 60px;
      background-color: #020617;
      border-bottom: 1px solid rgba(204, 195, 215, 0.08);
    }

    .top-app-bar__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 24px;
    }

    .top-app-bar__brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .top-app-bar__logo-icon {
      width: 20px;
      height: 20px;
      color: #6d28d9;
      stroke: currentColor;
    }

    .top-app-bar__title {
      font-family: 'Inter', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #dae2fd;
      line-height: 28px;
    }

    .top-app-bar__action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: color 0.2s, background 0.2s;
    }

    .top-app-bar__action:hover {
      color: #dae2fd;
      background: rgba(255, 255, 255, 0.06);
    }

    .top-app-bar__action svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }
  `,
})
export class TopAppBarComponent {}
