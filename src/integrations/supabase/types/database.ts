import { TablesRow } from './tables';

export type Database = {
  public: {
    Tables: {
      followers: {
        Row: TablesRow['followers'];
        Insert: Partial<TablesRow['followers']>;
        Update: Partial<TablesRow['followers']>;
      };
      messages: {
        Row: TablesRow['messages'];
        Insert: Partial<TablesRow['messages']>;
        Update: Partial<TablesRow['messages']>;
      };
      note_activities: {
        Row: TablesRow['note_activities'];
        Insert: Partial<TablesRow['note_activities']>;
        Update: Partial<TablesRow['note_activities']>;
      };
      note_likes: {
        Row: TablesRow['note_likes'];
        Insert: Partial<TablesRow['note_likes']>;
        Update: Partial<TablesRow['note_likes']>;
      };
      notes: {
        Row: TablesRow['notes'];
        Insert: Partial<TablesRow['notes']>;
        Update: Partial<TablesRow['notes']>;
      };
      notifications: {
        Row: TablesRow['notifications'];
        Insert: Partial<TablesRow['notifications']>;
        Update: Partial<TablesRow['notifications']>;
      };
      profiles: {
        Row: TablesRow['profiles'];
        Insert: Partial<TablesRow['profiles']>;
        Update: Partial<TablesRow['profiles']>;
      };
      room_participants: {
        Row: TablesRow['room_participants'];
        Insert: Partial<TablesRow['room_participants']>;
        Update: Partial<TablesRow['room_participants']>;
      };
      saved_notes: {
        Row: TablesRow['saved_notes'];
        Insert: Partial<TablesRow['saved_notes']>;
        Update: Partial<TablesRow['saved_notes']>;
      };
      study_rooms: {
        Row: TablesRow['study_rooms'];
        Insert: Partial<TablesRow['study_rooms']>;
        Update: Partial<TablesRow['study_rooms']>;
      };
      zoom_meetings: {
        Row: TablesRow['zoom_meetings'];
        Insert: Partial<TablesRow['zoom_meetings']>;
        Update: Partial<TablesRow['zoom_meetings']>;
      };
      subscriptions: {
        Row: TablesRow['subscriptions'];
        Insert: Partial<TablesRow['subscriptions']>;
        Update: Partial<TablesRow['subscriptions']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];