import { Note } from "@/types/notes";
import NoteCard from "./NoteCard";
import { useNavigate } from "react-router-dom";

interface NoteListProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

const NoteList = ({ notes, onNoteClick }: NoteListProps) => {
  const navigate = useNavigate();

  const handleMessageClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    console.log("Navigating to chat:", userId); // Debug log
    navigate(`/dashboard/chat/${userId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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