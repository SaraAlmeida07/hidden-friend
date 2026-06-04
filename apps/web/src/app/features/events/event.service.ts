import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event } from '../../core/models/event.model';
import { AuthService } from '../../core/auth/auth.service';
import { Observable, tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/events';

  // Signals for state management
  private eventsSignal = signal<Event[]>([]);
  private loadingSignal = signal<boolean>(false);

  // Expose readonly signals
  readonly events = this.eventsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  // Computed
  readonly activeEvents = computed(() => this.eventsSignal().filter(e => e.status === 'pending'));
  readonly completedEvents = computed(() => this.eventsSignal().filter(e => e.status === 'draw_done'));

  loadEvents(): Observable<Event[]> {
    this.loadingSignal.set(true);
    const user = this.authService.currentUser();
    const url = user ? `${this.apiUrl}?organizer_id=${user.id}` : this.apiUrl;
    
    return this.http.get<Event[]>(url).pipe(
      tap(events => {
        this.eventsSignal.set(events);
        this.loadingSignal.set(false);
      })
    );
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(eventData: Omit<Event, 'id' | 'organizer_id' | 'status' | 'created_at'>): Observable<Event> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User must be logged in to create an event');

    const newEvent: Partial<Event> = {
      ...eventData,
      organizer_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    return this.http.post<Event>(this.apiUrl, newEvent).pipe(
      tap(created => {
        this.eventsSignal.update(events => [...events, created]);
      })
    );
  }

  updateEvent(id: string, eventData: Partial<Event>): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, eventData).pipe(
      tap(updated => {
        this.eventsSignal.update(events => 
          events.map(e => e.id === id ? { ...e, ...updated } : e)
        );
      })
    );
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.eventsSignal.update(events => events.filter(e => e.id !== id));
      })
    );
  }
}
