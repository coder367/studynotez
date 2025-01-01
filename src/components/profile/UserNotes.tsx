import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "../dashboard/ViewNoteModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Note } from "@/types/notes";

interface UserNotesProps {
  userId: string;
}

export const UserNotes = ({ userId }: UserNotesProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const navigate = useNavigate();

  const { data: notes = [] } = useQuery({
    queryKey: ["user-notes", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select(`
          *,
          profile:profiles(
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      return (data || []).map((note) => ({
        ...note,
        profile: note.profile || null
      })) as Note[];
    },
  });

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="w-full">
          <CardContent className="p-4">
            <div
              className="flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleNoteClick(note)}
            >
              <FileText className="h-5 w-5 text-secondary" />
              <div>
                <p className="font-medium">{note.title}</p>
                {note.subject && (
                  <p className="text-sm text-muted-foreground">
                    <span>{note.subject}</span>
                    {note.university && (
                      <>
                        {" - "}
                        <span 
                          className="hover:text-primary cursor-pointer"
                          onClick={(e) => handleUniversityClick(e, note.university || "")}
                        >
                          {note.university}
                        </span>
                      </>
                    )}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Created {new Date(note.created_at).toLocaleString()}
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