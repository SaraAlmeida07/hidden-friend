export interface Participant {
  id: string;
  event_id: string;
  name: string;
  email: string;
  token: string;
  confirmed_at: string | null;
  created_at: string;
}
