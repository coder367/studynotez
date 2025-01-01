import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "./ViewNoteModal";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/notes";
import NoteCard from "./notes/NoteCard";
import { useNavigate } from "react-router-dom";

const Library = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchSavedNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_notes")
        .select(`
          notes (
            *,
            profile:profiles!notes_user_id_fkey (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved notes:", error);
        return;
      }

      if (data) {
        const formattedNotes = data.map(item => ({
          ...item.notes,
          profile: item.notes.profile
        }));
        setNotes(formattedNotes);
      }
    };

    fetchSavedNotes();
  }, []);

  const handleNoteClick = async (note: Note) => {
    if (!currentUserId) return;
    
    await supabase.from("note_activities").insert({
      user_id: currentUserId,
      note_id: note.id,
      activity_type: "view",
    });
    setSelectedNote(note);
  };

  const handleMessageClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to message users",
        variant: "destructive",
      });
      return;
    }
    navigate(`/dashboard/chat?user=${userId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onNoteClick={handleNoteClick}
          onMessageClick={handleMessageClick}
        />
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

export default Library;