import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { AuthService } from '../../core/auth/auth.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('EventService', () => {
  let service: EventService;
  let mockSupabaseService: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockSupabaseService = {
      client: {
        from: vi.fn().mockImplementation(() => {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'event-1', name: 'Amigo Secreto da Firma', location: 'Escritório', suggested_gift_value: 50 },
              error: null
            }),
            insert: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                { id: 'event-1', name: 'Amigo Secreto da Firma', location: 'Escritório', suggested_gift_value: 50, status: 'pending' }
              ],
              error: null
            })
          } as any;
        })
      }
    };

    mockAuthService = {
      currentUser: vi.fn().mockReturnValue({ id: 'user-1', email: 'organizer@example.com' })
    };

    TestBed.configureTestingModule({
      providers: [
        EventService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(EventService);
  });

  it('should retrieve event details by ID', async () => {
    const event = await service.getEventById('event-1');
    expect(event.id).toBe('event-1');
    expect(event.name).toBe('Amigo Secreto da Firma');
  });
});
