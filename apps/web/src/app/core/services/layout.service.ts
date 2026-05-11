import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly _isSidenavOpen = signal(false);
  readonly isSidenavOpen = this._isSidenavOpen.asReadonly();

  toggleSidenav() {
    this._isSidenavOpen.update((open) => !open);
  }

  closeSidenav() {
    this._isSidenavOpen.set(false);
  }

  openSidenav() {
    this._isSidenavOpen.set(true);
  }
}
