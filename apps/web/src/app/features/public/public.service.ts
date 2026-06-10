import { Injectable, inject } from '@angular/core';
import { Participant } from '../../core/models/participant.model';
import { Wishlist } from '../../core/models/wishlist.model';
import { Event } from '../../core/models/event.model';
import { DrawResult } from '../../core/models/draw.model';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private supabaseService = inject(SupabaseService);

  // Find participant by token
  async getParticipantByToken(token: string): Promise<Participant | null> {
    const { data, error } = await this.supabaseService.client
      .from('participants')
      .select('*')
      .eq('token', token);

    if (error) return null;
    return data && data.length > 0 ? data[0] : null;
  }

  async getEventById(eventId: string): Promise<Event> {
    const { data, error } = await this.supabaseService.client
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) throw error || new Error('Failed to get event');
    return data;
  }

  // Verify identity (name and email match)
  async verifyIdentity(participantId: string, name: string, email: string): Promise<boolean> {
    const { data, error } = await this.supabaseService.client
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (error || !data) return false;
    return data.name.trim().toLowerCase() === name.trim().toLowerCase() && 
           data.email.trim().toLowerCase() === email.trim().toLowerCase();
  }

  async saveWishlist(participantId: string, wishes: { wish_1: string, wish_2: string, wish_3: string }): Promise<Wishlist> {
    const newWishlist = {
      participant_id: participantId,
      ...wishes
    };

    const { data, error } = await this.supabaseService.client
      .from('wishlists')
      .insert(newWishlist)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save wishlist');
    return data;
  }

  async markParticipantConfirmed(participantId: string): Promise<Participant> {
    const { data, error } = await this.supabaseService.client
      .from('participants')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', participantId)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to confirm participant');
    return data;
  }

  // Get who this participant is giving a gift to (the receiver)
  async getDrawReveal(participantId: string): Promise<{ receiver: Participant, wishlist: Wishlist | null } | null> {
    // 1. Find the draw result where giver_participant_id matches
    const { data: results, error: resultsError } = await this.supabaseService.client
      .from('draw_results')
      .select('*')
      .eq('giver_participant_id', participantId);

    if (resultsError || !results || results.length === 0) return null;

    const receiverId = results[0].receiver_participant_id;

    // 2. Fetch the receiver's participant info and their wishlist
    const [resReceiver, resWishlists] = await Promise.all([
      this.supabaseService.client.from('participants').select('*').eq('id', receiverId).single(),
      this.supabaseService.client.from('wishlists').select('*').eq('participant_id', receiverId)
    ]);

    if (resReceiver.error || resWishlists.error || !resReceiver.data) {
      throw new Error('Failed to fetch draw reveal details');
    }

    const receiver: Participant = resReceiver.data;
    const wishlists: Wishlist[] = resWishlists.data || [];

    return {
      receiver,
      wishlist: wishlists.length > 0 ? wishlists[0] : null
    };
  }
}
