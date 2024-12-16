import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "./ViewNoteModal";
import { useNavigate } from "react-router-dom";

interface Note {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  university?: string;
  file_url?: string;
  file_type?: string;
  user_id: string;
  created_at: string;
}

interface RecentNote {
  created_at: string;
  notes: Note;
}

const RecentNotes = () => {
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const navigate = useNavigate();

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
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentNotes(data as RecentNote[]);
      }
    };

    fetchRecentNotes();
  }, []);

  const handleNoteClick = async (note: Note) => {
    await supabase.from("note_activities").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      note_id: note.id,
      activity_type: "view",
    });
    setSelectedNote(note);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  return (
    <>
      {recentNotes.map((activity) => (
        <Card
          key={`${activity.notes.id}-${activity.created_at}`}
          className="w-[300px] flex-shrink-0"
        >
          <CardContent className="p-4">
            <div
              className="flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleNoteClick(activity.notes)}
            >
              <FileText className="h-5 w-5 text-secondary" />
              <div>
                <p className="font-medium">{activity.notes.title}</p>
                {activity.notes.subject && (
                  <p 
                    className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(activity.notes.user_id);
                    }}
                  >
                    {activity.notes.subject} - {activity.notes.university || "Unknown University"}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Viewed {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {selectedNote && (
        <ViewNoteModal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          note={selectedNote}
        />
      )}
    </>
  );
};

export default RecentNotes;