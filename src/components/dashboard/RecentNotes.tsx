import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "./ViewNoteModal";
import { useNavigate } from "react-router-dom";
import { Note } from "@/types/notes";

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
            *,
            profile:profiles(
              full_name,
              avatar_url
            )
          )
        `)
        .eq("activity_type", "view")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const uniqueNotes = data.reduce((acc: RecentNote[], current: RecentNote) => {
          const exists = acc.find(item => item.notes.id === current.notes.id);
          if (!exists) {
            acc.push({
              ...current,
              notes: {
                ...current.notes,
                profile: current.notes.profile || null
              }
            });
          }
          return acc;
        }, []);

        setRecentNotes(uniqueNotes.slice(0, 10));
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

  const handleUniversityClick = (e: React.MouseEvent, university: string) => {
    e.stopPropagation();
    navigate(`/dashboard/notes?university=${encodeURIComponent(university)}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {recentNotes.map((activity) => (
        <Card
          key={`${activity.notes.id}-${activity.created_at}`}
          className="w-full"
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
                  <p className="text-sm text-muted-foreground">
                    <span>{activity.notes.subject}</span>
                    {activity.notes.university && (
                      <>
                        {" - "}
                        <span 
                          className="hover:text-primary cursor-pointer"
                          onClick={(e) => handleUniversityClick(e, activity.notes.university || "")}
                        >
                          {activity.notes.university}
                        </span>
                      </>
                    )}
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
    </div>
  );
};

export default RecentNotes;