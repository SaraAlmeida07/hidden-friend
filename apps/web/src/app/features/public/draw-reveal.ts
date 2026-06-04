import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-draw-reveal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 48px 24px; color: #dae2fd;">
      <h1>Revelação do Sorteio</h1>
      <p style="color: #94a3b8;">Em construção — Fase 4</p>
    </div>
  `,
})
export class DrawRevealComponent {}
