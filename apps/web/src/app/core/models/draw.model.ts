export interface Draw {
  id: string;
  event_id: string;
  performed_at: string;
}

export interface DrawResult {
  id: string;
  draw_id: string;
  giver_participant_id: string;
  receiver_participant_id: string;
}
