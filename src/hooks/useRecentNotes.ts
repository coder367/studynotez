import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/notes";

export const useRecentNotes = () => {
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("note_activities")
        .select(`
          created_at,
          notes (
            id,
            title,
            description,
            subject,
            university,
            file_url,
            file_type,
            user_id,
            created_at
          )
        `)
        .eq("activity_type", "view")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const uniqueNotes = data.reduce((acc: any[], current: any) => {
          const exists = acc.find(item => item.notes.id === current.notes.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setRecentNotes(uniqueNotes.slice(0, 10));
      }
    };

    fetchRecentNotes();
  }, []);

  return recentNotes;
};