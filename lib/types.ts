export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  invite_code: string | null;
  created_by: string;
  created_at: string;
};

export type EventMember = {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
};

export type Photo = {
  id: string;
  event_id: string;
  user_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string | null;
  uploaded_at: string;
};
