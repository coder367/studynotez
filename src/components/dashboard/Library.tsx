import { useEffect, useState } from "react";
import { FileText, User, MessageSquare, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ViewNoteModal from "./ViewNoteModal";
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  university: string;
  created_at: string;
  file_type?: string;
  file_url?: string;
  preview_image?: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

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
          note_id,
          notes (
            *,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data.map(item => ({
          ...item.notes,
          profiles: item.notes.profiles
        })));
      }
    };

    fetchSavedNotes();
  }, []);

  const handleNoteClick = async (note: Note) => {
    await supabase.from("note_activities").insert({
      user_id: currentUserId,
      note_id: note.id,
      activity_type: "view",
    });
    setSelectedNote(note);
  };

  const handleUniversityClick = (e: React.MouseEvent, university: string) => {
    e.stopPropagation();
    navigate(`/dashboard/notes?university=${encodeURIComponent(university)}`);
  };

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/dashboard/profile/${userId}`);
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
        <Card
          key={note.id}
          className="w-full hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleNoteClick(note)}
        >
          <CardContent className="p-4">
            {note.preview_image ? (
              <AspectRatio ratio={16 / 9} className="mb-4 overflow-hidden rounded-lg bg-muted">
                <img
                  src={note.preview_image}
                  alt={note.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </AspectRatio>
            ) : (
              <div className="flex items-center justify-center bg-muted rounded-lg mb-4 aspect-video">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium line-clamp-1">{note.title}</p>
              {note.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {note.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  onClick={(e) => handleProfileClick(e, note.user_id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={note.profiles?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {note.profiles?.full_name || "Anonymous"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => handleMessageClick(e, note.user_id)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
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

export default Library;