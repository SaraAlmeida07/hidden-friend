import { Injectable, inject } from '@angular/core';
import { Participant } from '../../core/models/participant.model';
import { Draw, DrawResult } from '../../core/models/draw.model';
import { EventService } from '../events/event.service';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DrawService {
  private eventService = inject(EventService);
  private supabaseService = inject(SupabaseService);

  async performDraw(eventId: string, participants: Participant[]): Promise<boolean> {
    if (participants.length < 3) {
      throw new Error('Mínimo de 3 participantes necessário para o sorteio.');
    }

    // 1. Generate draw
    const newDraw = {
      event_id: eventId,
      performed_at: new Date().toISOString()
    };

    const { data: draw, error: drawError } = await this.supabaseService.client
      .from('draws')
      .insert(newDraw)
      .select()
      .single();

    if (drawError || !draw) throw drawError || new Error('Failed to create draw');

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

    // 3. Save all pairs in a single bulk insert
    const { error: resultsError } = await this.supabaseService.client
      .from('draw_results')
      .insert(pairs);

    if (resultsError) throw resultsError;

    // 4. Update Event Status
    await this.eventService.updateEvent(eventId, { status: 'draw_done' });

    return true;
  }

  async getDrawByEventId(eventId: string): Promise<Draw[]> {
    const { data, error } = await this.supabaseService.client
      .from('draws')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;
    return data || [];
  }

  async getDrawResults(drawId: string): Promise<DrawResult[]> {
    const { data, error } = await this.supabaseService.client
      .from('draw_results')
      .select('*')
      .eq('draw_id', drawId);

    if (error) throw error;
    return data || [];
  }
}
