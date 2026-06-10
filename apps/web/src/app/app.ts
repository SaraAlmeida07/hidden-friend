import { ChangeDetectionStrategy, Component, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected isOffline = signal(!navigator.onLine);

  @HostListener('window:offline')
  protected onOffline(): void {
    this.isOffline.set(true);
  }

  @HostListener('window:online')
  protected onOnline(): void {
    this.isOffline.set(false);
  }
}
