import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Participant } from '../../core/models/participant.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/participants';

  private participantsSignal = signal<Participant[]>([]);
  readonly participants = this.participantsSignal.asReadonly();

  loadParticipants(eventId: string): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.apiUrl}?event_id=${eventId}`).pipe(
      tap(participants => {
        this.participantsSignal.set(participants);
      })
    );
  }

  addParticipant(eventId: string, name: string, email: string): Observable<Participant> {
    const newParticipant: Partial<Participant> = {
      event_id: eventId,
      name,
      email,
      token: crypto.randomUUID(),
      confirmed_at: null,
      created_at: new Date().toISOString()
    };

    return this.http.post<Participant>(this.apiUrl, newParticipant).pipe(
      tap(created => {
        this.participantsSignal.update(participants => [...participants, created]);
      })
    );
  }

  removeParticipant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.participantsSignal.update(participants => participants.filter(p => p.id !== id));
      })
    );
  }
}
