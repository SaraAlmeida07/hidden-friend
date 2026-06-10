import { Injectable, inject, signal } from '@angular/core';
import { Participant } from '../../core/models/participant.model';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private supabaseService = inject(SupabaseService);

  private participantsSignal = signal<Participant[]>([]);
  readonly participants = this.participantsSignal.asReadonly();

  async loadParticipants(eventId: string): Promise<Participant[]> {
    const { data, error } = await this.supabaseService.client
      .from('participants')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;
    const participants: Participant[] = data || [];
    this.participantsSignal.set(participants);
    return participants;
  }

  async addParticipant(eventId: string, name: string, email: string): Promise<Participant> {
    const newParticipant = {
      event_id: eventId,
      name,
      email,
      token: crypto.randomUUID(),
      confirmed_at: null
    };

    const { data, error } = await this.supabaseService.client
      .from('participants')
      .insert(newParticipant)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to add participant');
    this.participantsSignal.update(participants => [...participants, data]);
    return data;
  }

  async removeParticipant(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.participantsSignal.update(participants => participants.filter(p => p.id !== id));
  }
}
