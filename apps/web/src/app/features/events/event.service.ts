import { Injectable, inject, signal, computed } from '@angular/core';
import { Event } from '../../core/models/event.model';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
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

  async loadEvents(): Promise<Event[]> {
    this.loadingSignal.set(true);
    const user = this.authService.currentUser();
    const url = user ? `${this.apiUrl}?organizer_id=${user.id}` : this.apiUrl;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load events');
      const events: Event[] = await response.json();
      this.eventsSignal.set(events);
      return events;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getEventById(id: string): Promise<Event> {
    const response = await fetch(`${this.apiUrl}/${id}`);
    if (!response.ok) throw new Error('Failed to get event');
    return response.json();
  }

  async createEvent(eventData: Omit<Event, 'id' | 'organizer_id' | 'status' | 'created_at'>): Promise<Event> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User must be logged in to create an event');

    const newEvent = {
      ...eventData,
      organizer_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newEvent)
    });

    if (!response.ok) throw new Error('Failed to create event');
    const created: Event = await response.json();
    this.eventsSignal.update(events => [...events, created]);
    return created;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) throw new Error('Failed to update event');
    const updated: Event = await response.json();
    this.eventsSignal.update(events => 
      events.map(e => e.id === id ? { ...e, ...updated } : e)
    );
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete event');
    this.eventsSignal.update(events => events.filter(e => e.id !== id));
  }
}
