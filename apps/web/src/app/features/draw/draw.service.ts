import { Injectable, inject } from '@angular/core';
import { Participant } from '../../core/models/participant.model';
import { Draw, DrawResult } from '../../core/models/draw.model';
import { EventService } from '../events/event.service';

@Injectable({
  providedIn: 'root'
})
export class DrawService {
  private eventService = inject(EventService);

  private apiUrlDraws = 'http://localhost:3000/draws';
  private apiUrlDrawResults = 'http://localhost:3000/draw_results';

  async performDraw(eventId: string, participants: Participant[]): Promise<boolean> {
    if (participants.length < 3) {
      throw new Error('Mínimo de 3 participantes necessário para o sorteio.');
    }

    // 1. Generate draw
    const newDraw = {
      event_id: eventId,
      performed_at: new Date().toISOString()
    };

    const resDraw = await fetch(this.apiUrlDraws, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDraw)
    });

    if (!resDraw.ok) throw new Error('Failed to create draw');
    const draw: Draw = await resDraw.json();

    // 2. Generate pairs
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const pairs = shuffled.map((giver, i) => {
      const receiver = i === shuffled.length - 1 ? shuffled[0] : shuffled[i + 1];
      return {
        draw_id: draw.id,
        giver_participant_id: giver.id,
        receiver_participant_id: receiver.id
      };
    });

    // 3. Save all pairs sequentially to avoid json-server lock errors
    for (const pair of pairs) {
      const resPair = await fetch(this.apiUrlDrawResults, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pair)
      });
      if (!resPair.ok) throw new Error('Failed to save draw result');
    }

    // 4. Update Event Status
    await this.eventService.updateEvent(eventId, { status: 'draw_done' });

    return true;
  }

  async getDrawByEventId(eventId: string): Promise<Draw[]> {
    const response = await fetch(`${this.apiUrlDraws}?event_id=${eventId}`);
    if (!response.ok) throw new Error('Failed to get draw');
    return response.json();
  }

  async getDrawResults(drawId: string): Promise<DrawResult[]> {
    const response = await fetch(`${this.apiUrlDrawResults}?draw_id=${drawId}`);
    if (!response.ok) throw new Error('Failed to get draw results');
    return response.json();
  }
}
