import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { from, switchMap, tap, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Event } from '../../core/models/event.model';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.supabaseUrl}/rest/v1/events`;
  private headers = {
    'apikey': environment.supabaseKey
  };

  // Signals for state management
  private loadingSignal = signal<boolean>(false);
  readonly isLoading = this.loadingSignal.asReadonly();

  // Trigger signal to refresh events
  private refreshSignal = signal<number>(0);

  // Observable stream of events, reactively fetching whenever refreshSignal is updated
  private events$ = toObservable(this.refreshSignal).pipe(
    tap(() => this.loadingSignal.set(true)),
    switchMap(() => from(this.fetchEventsFromSupabase())),
    tap(() => this.loadingSignal.set(false))
  );

  // Expose readonly signal of events
  readonly events = toSignal(this.events$, { initialValue: [] as Event[] });

  // Computed
  readonly activeEvents = computed(() => this.events().filter(e => e.status === 'pending'));
  readonly completedEvents = computed(() => this.events().filter(e => e.status === 'draw_done'));

  private async fetchEventsFromSupabase(): Promise<Event[]> {
    const user = this.authService.currentUser();
    if (!user) return [];

    try {
      const data = await firstValueFrom(
        this.http.get<Event[]>(`${this.apiUrl}?organizer_id=eq.${user.id}&order=created_at.desc`, {
          headers: this.headers
        })
      );
      return data || [];
    } catch (error) {
      console.error('Error fetching events from Supabase REST API:', error);
      return [];
    }
  }

  loadEvents(): void {
    this.refreshSignal.update(n => n + 1);
  }

  async getEventById(id: string): Promise<Event> {
    try {
      const data = await firstValueFrom(
        this.http.get<Event>(`${this.apiUrl}?id=eq.${id}`, {
          headers: {
            ...this.headers,
            'Accept': 'application/vnd.pgrst.object+json'
          }
        })
      );
      return data;
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw error;
    }
  }

  async createEvent(eventData: Omit<Event, 'id' | 'organizer_id' | 'status' | 'created_at'>): Promise<Event> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User must be logged in to create an event');

    const newEvent = {
      ...eventData,
      organizer_id: user.id,
      status: 'pending'
    };

    try {
      const data = await firstValueFrom(
        this.http.post<Event>(this.apiUrl, newEvent, {
          headers: {
            ...this.headers,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'Accept': 'application/vnd.pgrst.object+json'
          }
        })
      );
      
      // Trigger a refresh of the events signal stream
      this.loadEvents();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    try {
      const data = await firstValueFrom(
        this.http.patch<Event>(`${this.apiUrl}?id=eq.${id}`, eventData, {
          headers: {
            ...this.headers,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'Accept': 'application/vnd.pgrst.object+json'
          }
        })
      );
      
      // Trigger a refresh of the events signal stream
      this.loadEvents();
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}?id=eq.${id}`, {
          headers: this.headers
        })
      );
      
      // Trigger a refresh of the events signal stream
      this.loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
