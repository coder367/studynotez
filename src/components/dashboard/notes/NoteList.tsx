import { Note } from "@/types/notes";
import NoteCard from "./NoteCard";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface NoteListProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

const NoteList = ({ notes, onNoteClick }: NoteListProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleMessageClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    console.log("Navigating to chat:", userId);
    navigate(`/dashboard/chat/${userId}`);
  };

  return (
    <div className={`grid gap-3 sm:gap-4 md:gap-6 ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onNoteClick={onNoteClick}
          onMessageClick={handleMessageClick}
        />
      ))}
    </div>
  );
};

export default NoteList;