import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

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

  constructor() {}

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

  async login(email: string, password_hash: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiUrl}?email=${encodeURIComponent(email)}&password_hash=${encodeURIComponent(password_hash)}`);
      if (!response.ok) return null;
      const users: User[] = await response.json();
      const user = users.length > 0 ? users[0] : null;
      if (user) {
        this.setStoredUser(user);
      }
      return user;
    } catch {
      return null;
    }
  }

  async register(name: string, email: string, password_hash: string): Promise<User> {
    const newUser = {
      name,
      email,
      password_hash,
      created_at: new Date().toISOString()
    };
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });
    
    if (!response.ok) {
      throw new Error('Erro ao registrar usuário');
    }
    
    const user: User = await response.json();
    this.setStoredUser(user);
    return user;
  }

  logout(): void {
    this.setStoredUser(null);
  }
}
