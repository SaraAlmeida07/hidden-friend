import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { AuthService } from '../../core/auth/auth.service';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Event } from '../../core/models/event.model';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      currentUser: vi.fn().mockReturnValue({ id: 'user-1', email: 'organizer@example.com' })
    };

    TestBed.configureTestingModule({
      providers: [
        EventService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve event details by ID', async () => {
    const mockEvent: Event = { 
      id: 'event-1', 
      name: 'Amigo Secreto da Firma', 
      location: 'Escritório', 
      suggested_gift_value: 50,
      organizer_id: 'user-1',
      status: 'pending',
      date: '2026-12-25',
      created_at: ''
    };

    const promise = service.getEventById('event-1');

    const req = httpMock.expectOne(r => r.url.includes('/rest/v1/events') && r.url.includes('id=eq.event-1'));
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Accept')).toBe('application/vnd.pgrst.object+json');
    req.flush(mockEvent);

    const event = await promise;
    expect(event.id).toBe('event-1');
    expect(event.name).toBe('Amigo Secreto da Firma');
  });
});
