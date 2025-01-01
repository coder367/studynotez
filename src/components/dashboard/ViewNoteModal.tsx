import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Note } from "@/types/notes";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const ViewNoteModal = ({ isOpen, onClose, note }: ViewNoteModalProps) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl p-0 gap-0 ${isMobile ? 'h-[100dvh] w-full' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {note.subject && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {note.subject}
                  </span>
                )}
                {note.university && (
                  <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                    {note.university}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {note.description && (
              <p className="text-muted-foreground mb-4">{note.description}</p>
            )}
            {note.preview_image ? (
              <img
                src={note.preview_image}
                alt={note.title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : note.content ? (
              <div className="prose dark:prose-invert max-w-none">
                {note.content}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Created {new Date(note.created_at).toLocaleDateString()}
              </div>
              {note.file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={note.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;