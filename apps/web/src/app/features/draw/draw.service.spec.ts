import { TestBed } from '@angular/core/testing';
import { DrawService } from './draw.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { EventService } from '../events/event.service';
import { Participant } from '../../core/models/participant.model';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('DrawService', () => {
  let service: DrawService;
  let mockSupabaseService: any;
  let mockEventService: any;
  let insertSpy: any;

  beforeEach(() => {
    insertSpy = vi.fn().mockImplementation((pairs: any) => {
      return Promise.resolve({ error: null });
    });

    mockSupabaseService = {
      client: {
        from: vi.fn().mockImplementation((table: string) => {
          return {
            insert: vi.fn().mockImplementation((data: any) => {
              if (table === 'draws') {
                return {
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'mock-draw-id', event_id: data.event_id, performed_at: data.performed_at },
                    error: null
                  })
                };
              }
              if (table === 'draw_results') {
                return insertSpy(data);
              }
              return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              };
            })
          } as any;
        })
      }
    };

    mockEventService = {
      updateEvent: vi.fn().mockResolvedValue({ id: 'event-1', status: 'draw_done' })
    };

    TestBed.configureTestingModule({
      providers: [
        DrawService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: EventService, useValue: mockEventService }
      ]
    });

    service = TestBed.inject(DrawService);
  });

  const generateMockParticipants = (count: number): Participant[] => {
    const list: Participant[] = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        id: `p-${i}`,
        event_id: 'event-1',
        name: `Participant ${i}`,
        email: `p${i}@example.com`,
        token: `token-${i}`,
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
    return list;
  };

  it('should throw an error if trying to draw with less than 3 participants', async () => {
    const participants = generateMockParticipants(2);
    await expect(service.performDraw('event-1', participants)).rejects.toThrow(
      'Mínimo de 3 participantes necessário para o sorteio.'
    );
    expect(mockEventService.updateEvent).not.toHaveBeenCalled();
  });

  it('should generate valid pairs with no self-draw and complete loop when minimum participants rule is met', async () => {
    const participants = generateMockParticipants(5);
    const result = await service.performDraw('event-1', participants);

    expect(result).toBe(true);
    expect(mockEventService.updateEvent).toHaveBeenCalledWith('event-1', { status: 'draw_done' });

    // Inspect the generated pairs sent to insertSpy
    expect(insertSpy).toHaveBeenCalled();
    const insertedPairs = insertSpy.mock.calls[0][0];

    expect(insertedPairs.length).toBe(5);

    const givers = new Set<string>();
    const receivers = new Set<string>();

    for (const pair of insertedPairs) {
      expect(pair.draw_id).toBe('mock-draw-id');
      // No self-drawing
      expect(pair.giver_participant_id).not.toBe(pair.receiver_participant_id);

      givers.add(pair.giver_participant_id);
      receivers.add(pair.receiver_participant_id);
    }

    // Every participant must give exactly once
    expect(givers.size).toBe(5);
    // Every participant must receive exactly once
    expect(receivers.size).toBe(5);
  });
});
