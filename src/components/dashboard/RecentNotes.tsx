import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "./ViewNoteModal";

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
        .limit(5);

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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {recentNotes.length > 0 ? (
              recentNotes.map((activity) => (
                <div
                  key={`${activity.notes.id}-${activity.created_at}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleNoteClick(activity.notes)}
                >
                  <FileText className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">{activity.notes.title}</p>
                    {activity.notes.subject && (
                      <p className="text-sm text-muted-foreground">
                        {activity.notes.subject} - {activity.notes.university || "Unknown University"}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Viewed {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent notes</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      {selectedNote && (
        <ViewNoteModal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          note={selectedNote}
        />
      )}
    </Card>
  );
};

export default RecentNotes;