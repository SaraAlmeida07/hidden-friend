import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EventService } from './event.service';
import { Event } from '../../core/models/event.model';

export const eventResolver: ResolveFn<Event> = async (route) => {
  const eventService = inject(EventService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/events']);
    throw new Error('Event ID is missing');
  }

  try {
    return await eventService.getEventById(id);
  } catch (error) {
    router.navigate(['/events']);
    throw error;
  }
};
