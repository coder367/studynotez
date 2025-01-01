export interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  university: string | null;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  preview_image: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile: Profile | null;
}