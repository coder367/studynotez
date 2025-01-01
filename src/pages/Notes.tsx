import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ViewNoteModal from "@/components/dashboard/ViewNoteModal";
import SearchFilters from "@/components/dashboard/notes/SearchFilters";
import NoteList from "@/components/dashboard/notes/NoteList";
import { Note } from "@/types/notes";

const Notes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedUniversity, setSelectedUniversity] = useState<string | undefined>();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", searchQuery, selectedSubject, selectedUniversity],
    queryFn: async () => {
      let query = supabase
        .from("notes")
        .select(`
          *,
          profile:profiles!inner(
            full_name,
            avatar_url
          )
        `);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`);
      }
      if (selectedSubject) {
        query = query.eq("subject", selectedSubject);
      }
      if (selectedUniversity) {
        query = query.eq("university", selectedUniversity);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      
      return (data as any[]).map(note => ({
        ...note,
        profile: note.profile[0]
      })) as Note[];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("subject")
        .not("subject", "is", null);
      return [...new Set(data?.map(note => note.subject))];
    },
  });

  const { data: universities = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("university")
        .not("university", "is", null);
      return [...new Set(data?.map(note => note.university))];
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Notes</h1>
      </div>

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedUniversity={selectedUniversity}
        onUniversityChange={setSelectedUniversity}
        subjects={subjects}
        universities={universities}
      />

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : notes.length > 0 ? (
        <div className="mt-6">
          <NoteList notes={notes} onNoteClick={handleNoteClick} />
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          No notes found. Try adjusting your filters or search query.
        </div>
      )}

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

export default Notes;