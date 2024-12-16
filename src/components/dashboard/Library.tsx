import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "./ViewNoteModal";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  university: string;
  created_at: string;
  file_type?: string;
  file_url?: string;
  user_id: string;
}

const Library = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const fetchSavedNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_notes")
        .select(`
          note_id,
          notes (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data.map(item => item.notes));
      }
    };

    fetchSavedNotes();
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
        <CardTitle>My Library</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleNoteClick(note)}
                >
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{note.title}</p>
                    {note.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {note.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {note.subject && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {note.subject}
                        </span>
                      )}
                      {note.university && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                          {note.university}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Your library is empty</p>
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

export default Library;