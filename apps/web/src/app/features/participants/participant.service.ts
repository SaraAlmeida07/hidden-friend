import { Injectable, signal } from '@angular/core';
import { Participant } from '../../core/models/participant.model';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private apiUrl = 'http://localhost:3000/participants';

  private participantsSignal = signal<Participant[]>([]);
  readonly participants = this.participantsSignal.asReadonly();

  async loadParticipants(eventId: string): Promise<Participant[]> {
    const response = await fetch(`${this.apiUrl}?event_id=${eventId}`);
    if (!response.ok) throw new Error('Failed to load participants');
    const participants: Participant[] = await response.json();
    this.participantsSignal.set(participants);
    return participants;
  }

  async addParticipant(eventId: string, name: string, email: string): Promise<Participant> {
    const newParticipant = {
      event_id: eventId,
      name,
      email,
      token: crypto.randomUUID(),
      confirmed_at: null,
      created_at: new Date().toISOString()
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newParticipant)
    });

    if (!response.ok) throw new Error('Failed to add participant');
    const created: Participant = await response.json();
    this.participantsSignal.update(participants => [...participants, created]);
    return created;
  }

  async removeParticipant(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to remove participant');
    this.participantsSignal.update(participants => participants.filter(p => p.id !== id));
  }
}
