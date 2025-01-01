import { useState } from "react";
import { Search, ArrowLeft, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ViewNoteModal from "@/components/dashboard/ViewNoteModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

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
          profile:profiles(
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
      console.log("Notes with profiles:", data);
      return data as Note[];
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

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/dashboard/profile/${userId}`);
  };

  const handleUniversityClick = (e: React.MouseEvent, university: string) => {
    e.stopPropagation();
    navigate(`/dashboard/notes?university=${encodeURIComponent(university)}`);
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject || "undefined"}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select university" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All universities</SelectItem>
            {universities.map((university) => (
              <SelectItem key={university} value={university || "undefined"}>
                {university}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNoteClick(note)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-medium">{note.title}</h3>
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
                      <span 
                        className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full cursor-pointer hover:bg-secondary/20"
                        onClick={(e) => handleUniversityClick(e, note.university)}
                      >
                        {note.university}
                      </span>
                    )}
                  </div>
                  <div 
                    className="flex items-center gap-2 mt-4 cursor-pointer hover:opacity-80"
                    onClick={(e) => handleProfileClick(e, note.user_id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={note.profile?.avatar_url || undefined}
                        alt={note.profile?.full_name || "User"}
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hover:underline">
                      {note.profile?.full_name || "Anonymous"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
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