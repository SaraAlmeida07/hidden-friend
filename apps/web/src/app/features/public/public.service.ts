import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map, of, forkJoin, tap } from 'rxjs';
import { Participant } from '../../core/models/participant.model';
import { Wishlist } from '../../core/models/wishlist.model';
import { Event } from '../../core/models/event.model';
import { DrawResult } from '../../core/models/draw.model';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private http = inject(HttpClient);
  
  private apiUrlParticipants = 'http://localhost:3000/participants';
  private apiUrlEvents = 'http://localhost:3000/events';
  private apiUrlWishlists = 'http://localhost:3000/wishlists';
  private apiUrlDrawResults = 'http://localhost:3000/draw_results';

  // Find participant by token
  getParticipantByToken(token: string): Observable<Participant | null> {
    return this.http.get<Participant[]>(`${this.apiUrlParticipants}?token=${token}`).pipe(
      map(participants => participants.length > 0 ? participants[0] : null)
    );
  }

  getEventById(eventId: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrlEvents}/${eventId}`);
  }

  // Verify identity (name and email match)
  verifyIdentity(participantId: string, name: string, email: string): Observable<boolean> {
    return this.http.get<Participant>(`${this.apiUrlParticipants}/${participantId}`).pipe(
      map(p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && 
               p.email.trim().toLowerCase() === email.trim().toLowerCase())
    );
  }

  saveWishlist(participantId: string, wishes: { wish_1: string, wish_2: string, wish_3: string }): Observable<Wishlist> {
    const newWishlist: Partial<Wishlist> = {
      participant_id: participantId,
      ...wishes,
      created_at: new Date().toISOString()
    };
    return this.http.post<Wishlist>(this.apiUrlWishlists, newWishlist);
  }

  markParticipantConfirmed(participantId: string): Observable<Participant> {
    return this.http.patch<Participant>(`${this.apiUrlParticipants}/${participantId}`, {
      confirmed_at: new Date().toISOString()
    });
  }

  // Get who this participant is giving a gift to (the receiver)
  getDrawReveal(participantId: string): Observable<{ receiver: Participant, wishlist: Wishlist | null } | null> {
    // 1. Find the draw result where giver_participant_id matches
    return this.http.get<DrawResult[]>(`${this.apiUrlDrawResults}?giver_participant_id=${participantId}`).pipe(
      switchMap(results => {
        if (results.length === 0) return of(null);
        const receiverId = results[0].receiver_participant_id;

        // 2. Fetch the receiver's participant info and their wishlist
        return forkJoin({
          receiver: this.http.get<Participant>(`${this.apiUrlParticipants}/${receiverId}`),
          wishlistArr: this.http.get<Wishlist[]>(`${this.apiUrlWishlists}?participant_id=${receiverId}`)
        }).pipe(
          map(({ receiver, wishlistArr }) => ({
            receiver,
            wishlist: wishlistArr.length > 0 ? wishlistArr[0] : null
          }))
        );
      })
    );
  }
}
