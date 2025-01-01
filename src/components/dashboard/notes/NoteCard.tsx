import { FileText, User, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/notes";
import { useNavigate } from "react-router-dom";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onMessageClick: (e: React.MouseEvent, userId: string) => void;
}

const NoteCard = ({ note, onNoteClick, onMessageClick }: NoteCardProps) => {
  const navigate = useNavigate();

  const handleUniversityClick = (e: React.MouseEvent, university: string) => {
    e.stopPropagation();
    navigate(`/dashboard/notes?university=${encodeURIComponent(university)}`);
  };

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/dashboard/profile/${userId}`);
  };

  return (
    <Card
      className="w-full hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onNoteClick(note)}
    >
      <CardContent className="p-2 sm:p-3">
        {note.preview_image ? (
          <AspectRatio ratio={16 / 9} className="mb-2 overflow-hidden rounded-lg bg-muted">
            <img
              src={note.preview_image}
              alt={note.title}
              className="object-cover w-full h-full"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </AspectRatio>
        ) : (
          <div className="flex items-center justify-center bg-muted rounded-lg mb-2 h-24 sm:h-32">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-medium text-sm sm:text-base line-clamp-1">{note.title}</p>
          {note.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {note.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {note.subject && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {note.subject}
              </span>
            )}
            {note.university && (
              <span 
                className="text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-secondary/20"
                onClick={(e) => handleUniversityClick(e, note.university!)}
              >
                {note.university}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <button 
              className="flex items-center gap-1.5 hover:opacity-80 focus:outline-none"
              onClick={(e) => handleProfileClick(e, note.user_id)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={note.profile?.avatar_url || undefined} 
                  alt={note.profile?.full_name || "User"}
                  loading="lazy"
                />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium hover:underline line-clamp-1">
                {note.profile?.full_name || "Anonymous"}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => onMessageClick(e, note.user_id)}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            {new Date(note.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;