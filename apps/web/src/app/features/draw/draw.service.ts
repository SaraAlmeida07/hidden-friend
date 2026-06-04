import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Participant } from '../../core/models/participant.model';
import { Draw, DrawResult } from '../../core/models/draw.model';
import { EventService } from '../events/event.service';
import { Observable, switchMap, forkJoin, map, from, concatMap, toArray } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawService {
  private http = inject(HttpClient);
  private eventService = inject(EventService);

  private apiUrlDraws = 'http://localhost:3000/draws';
  private apiUrlDrawResults = 'http://localhost:3000/draw_results';

  performDraw(eventId: string, participants: Participant[]): Observable<boolean> {
    if (participants.length < 3) {
      throw new Error('Mínimo de 3 participantes necessário para o sorteio.');
    }

    // 1. Generate draw
    const newDraw: Partial<Draw> = {
      event_id: eventId,
      performed_at: new Date().toISOString()
    };

    return this.http.post<Draw>(this.apiUrlDraws, newDraw).pipe(
      switchMap(draw => {
        // 2. Generate pairs
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const pairs: Partial<DrawResult>[] = shuffled.map((giver, i) => {
          const receiver = i === shuffled.length - 1 ? shuffled[0] : shuffled[i + 1];
          return {
            draw_id: draw.id,
            giver_participant_id: giver.id,
            receiver_participant_id: receiver.id
          };
        });

        // 3. Save all pairs sequentially to avoid json-server lock errors
        
        return from(pairs).pipe(
          concatMap(pair => this.http.post<DrawResult>(this.apiUrlDrawResults, pair)),
          toArray(),
          switchMap(() => {
            // 4. Update Event Status
            return this.eventService.updateEvent(eventId, { status: 'draw_done' });
          }),
          map(() => true)
        );
      })
    );
  }

  getDrawByEventId(eventId: string): Observable<Draw[]> {
    return this.http.get<Draw[]>(`${this.apiUrlDraws}?event_id=${eventId}`);
  }

  getDrawResults(drawId: string): Observable<DrawResult[]> {
    return this.http.get<DrawResult[]>(`${this.apiUrlDrawResults}?draw_id=${drawId}`);
  }
}
