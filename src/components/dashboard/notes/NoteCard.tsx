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
                onClick={(e) => handleUniversityClick(e, note.university!)}
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
                <AvatarImage src={note.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {note.profile?.full_name || "Anonymous"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => onMessageClick(e, note.user_id)}
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
  );
};

export default NoteCard;