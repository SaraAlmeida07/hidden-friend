export type EventStatus = 'pending' | 'draw_done';

export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  date: string;
  location: string;
  suggested_gift_value: number;
  status: EventStatus;
  created_at: string;
}
