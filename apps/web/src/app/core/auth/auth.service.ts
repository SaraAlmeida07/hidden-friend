import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable, tap, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  
  // State
  private userSignal = signal<User | null>(this.getStoredUser());
  
  // Selectors
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(private http: HttpClient) {}

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('hf_user');
    return stored ? JSON.parse(stored) : null;
  }

  private setStoredUser(user: User | null) {
    if (user) {
      localStorage.setItem('hf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hf_user');
    }
    this.userSignal.set(user);
  }

  login(email: string, password_hash: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password_hash=${password_hash}`).pipe(
      map(users => users.length > 0 ? users[0] : null),
      tap(user => {
        if (user) {
          this.setStoredUser(user);
        }
      }),
      catchError(() => of(null))
    );
  }

  register(name: string, email: string, password_hash: string): Observable<User> {
    const newUser: Partial<User> = {
      name,
      email,
      password_hash,
      created_at: new Date().toISOString()
    };
    
    return this.http.post<User>(this.apiUrl, newUser).pipe(
      tap(user => this.setStoredUser(user))
    );
  }

  logout(): void {
    this.setStoredUser(null);
  }
}
