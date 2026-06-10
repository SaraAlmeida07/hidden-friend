import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from '../models/user.model';
import { Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  
  // State
  private userSignal = signal<User | null>(null);
  private sessionSignal = signal<Session | null>(null);
  private initializedSignal = signal<boolean>(false);
  
  // Selectors
  readonly currentUser = this.userSignal.asReadonly();
  readonly currentSession = this.sessionSignal.asReadonly();
  readonly isInitialized = this.initializedSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor() {
    // Listen to Auth state changes
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(session);
    });
    
    // Initialize session
    this.initSession();
  }

  private async initSession() {
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    this.handleAuthStateChange(session);
  }

  private handleAuthStateChange(session: Session | null) {
    this.sessionSignal.set(session);
    if (session && session.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata['name'] || '',
        password_hash: '',
        created_at: session.user.created_at
      };
      this.userSignal.set(user);
    } else {
      this.userSignal.set(null);
    }
    this.initializedSignal.set(true);
  }

  async login(email: string, password_hash: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password: password_hash
    });
    
    if (error || !data.user) {
      throw error || new Error('Falha no login');
    }
    
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata['name'] || '',
      password_hash: '',
      created_at: data.user.created_at
    };
    
    return user;
  }

  async register(name: string, email: string, password_hash: string): Promise<User> {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password: password_hash,
      options: {
        data: { name }
      }
    });
    
    if (error || !data.user) {
      throw error || new Error('Falha no registro');
    }
    
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata['name'] || '',
      password_hash: '',
      created_at: data.user.created_at
    };
    
    return user;
  }

  async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
  }
}
