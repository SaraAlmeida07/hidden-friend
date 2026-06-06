import { Injectable } from '@angular/core';
import { Participant } from '../../core/models/participant.model';
import { Wishlist } from '../../core/models/wishlist.model';
import { Event } from '../../core/models/event.model';
import { DrawResult } from '../../core/models/draw.model';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private apiUrlParticipants = 'http://localhost:3000/participants';
  private apiUrlEvents = 'http://localhost:3000/events';
  private apiUrlWishlists = 'http://localhost:3000/wishlists';
  private apiUrlDrawResults = 'http://localhost:3000/draw_results';

  // Find participant by token
  async getParticipantByToken(token: string): Promise<Participant | null> {
    const response = await fetch(`${this.apiUrlParticipants}?token=${token}`);
    if (!response.ok) return null;
    const participants: Participant[] = await response.json();
    return participants.length > 0 ? participants[0] : null;
  }

  async getEventById(eventId: string): Promise<Event> {
    const response = await fetch(`${this.apiUrlEvents}/${eventId}`);
    if (!response.ok) throw new Error('Failed to get event');
    return response.json();
  }

  // Verify identity (name and email match)
  async verifyIdentity(participantId: string, name: string, email: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrlParticipants}/${participantId}`);
    if (!response.ok) return false;
    const p: Participant = await response.json();
    return p.name.trim().toLowerCase() === name.trim().toLowerCase() && 
           p.email.trim().toLowerCase() === email.trim().toLowerCase();
  }

  async saveWishlist(participantId: string, wishes: { wish_1: string, wish_2: string, wish_3: string }): Promise<Wishlist> {
    const newWishlist = {
      participant_id: participantId,
      ...wishes,
      created_at: new Date().toISOString()
    };
    
    const response = await fetch(this.apiUrlWishlists, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newWishlist)
    });

    if (!response.ok) throw new Error('Failed to save wishlist');
    return response.json();
  }

  async markParticipantConfirmed(participantId: string): Promise<Participant> {
    const response = await fetch(`${this.apiUrlParticipants}/${participantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmed_at: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('Failed to confirm participant');
    return response.json();
  }

  // Get who this participant is giving a gift to (the receiver)
  async getDrawReveal(participantId: string): Promise<{ receiver: Participant, wishlist: Wishlist | null } | null> {
    // 1. Find the draw result where giver_participant_id matches
    const resResults = await fetch(`${this.apiUrlDrawResults}?giver_participant_id=${participantId}`);
    if (!resResults.ok) return null;
    const results: DrawResult[] = await resResults.json();
    if (results.length === 0) return null;
    
    const receiverId = results[0].receiver_participant_id;

    // 2. Fetch the receiver's participant info and their wishlist
    const [resReceiver, resWishlists] = await Promise.all([
      fetch(`${this.apiUrlParticipants}/${receiverId}`),
      fetch(`${this.apiUrlWishlists}?participant_id=${receiverId}`)
    ]);

    if (!resReceiver.ok || !resWishlists.ok) throw new Error('Failed to fetch draw reveal details');

    const receiver: Participant = await resReceiver.json();
    const wishlists: Wishlist[] = await resWishlists.json();

    return {
      receiver,
      wishlist: wishlists.length > 0 ? wishlists[0] : null
    };
  }
}
