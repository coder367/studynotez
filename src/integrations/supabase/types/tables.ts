export type TablesRow = {
  followers: {
    created_at: string;
    follower_id: string | null;
    following_id: string | null;
    id: string;
  };
  messages: {
    content: string;
    created_at: string;
    file_type: string | null;
    file_url: string | null;
    id: string;
    read_at: string | null;
    receiver_id: string | null;
    sender_id: string | null;
  };
  note_activities: {
    activity_type: string;
    created_at: string;
    id: string;
    note_id: string | null;
    user_id: string;
  };
  note_likes: {
    created_at: string;
    id: string;
    note_id: string | null;
    user_id: string | null;
  };
  notes: {
    content: string | null;
    created_at: string;
    description: string | null;
    file_type: string | null;
    file_url: string | null;
    id: string;
    preview_image: string | null;
    subject: string | null;
    title: string;
    university: string | null;
    updated_at: string;
    user_id: string;
  };
  notifications: {
    created_at: string;
    data: Json | null;
    id: string;
    read: boolean | null;
    type: string;
    user_id: string | null;
  };
  profiles: {
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    full_name: string | null;
    github_url: string | null;
    id: string;
    linkedin_url: string | null;
    twitter_url: string | null;
    updated_at: string;
  };
  room_participants: {
    id: string;
    joined_at: string;
    room_id: string | null;
    user_id: string | null;
  };
  saved_notes: {
    created_at: string;
    id: string;
    note_id: string | null;
    user_id: string | null;
  };
  study_rooms: {
    created_at: string;
    created_by: string | null;
    deleted_at: string | null;
    id: string;
    invitation_code: string | null;
    is_public: boolean | null;
    name: string;
    type: string;
    updated_at: string;
  };
  zoom_meetings: {
    created_at: string;
    id: string;
    meeting_url: string;
    password: string | null;
    room_id: string | null;
  };
  subscriptions: {
    id: string;
    user_id: string;
    plan_type: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    created_at: string;
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];