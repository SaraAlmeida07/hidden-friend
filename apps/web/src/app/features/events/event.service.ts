import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { from, switchMap, tap } from 'rxjs';
import { Event } from '../../core/models/event.model';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);

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

    const { data, error } = await this.supabaseService.client
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return [];
    }

    return data || [];
  }

  loadEvents(): void {
    this.refreshSignal.update(n => n + 1);
  }

  async getEventById(id: string): Promise<Event> {
    const { data, error } = await this.supabaseService.client
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw error || new Error('Failed to get event');
    return data;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'organizer_id' | 'status' | 'created_at'>): Promise<Event> {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User must be logged in to create an event');

    const newEvent = {
      ...eventData,
      organizer_id: user.id,
      status: 'pending'
    };

    const { data, error } = await this.supabaseService.client
      .from('events')
      .insert(newEvent)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to create event');
    
    // Trigger a refresh of the events signal stream
    this.loadEvents();
    return data;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const { data, error } = await this.supabaseService.client
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to update event');
    
    // Trigger a refresh of the events signal stream
    this.loadEvents();
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Trigger a refresh of the events signal stream
    this.loadEvents();
  }
}
