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
    console.log("Navigating to chat:", userId);
    navigate(`/dashboard/chat/${userId}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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