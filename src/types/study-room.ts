export type StudyRoomType = "study" | "focus";

export interface StudyRoom {
  id: string;
  name: string;
  type: StudyRoomType;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  invitation_code?: string;
  room_participants?: { count: number }[];
}