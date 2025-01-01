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
          <div className="flex items-center justify-between p-3 sm:p-4 border-b">
            <div className="flex-1 mr-2">
              <h2 className="text-lg sm:text-xl font-semibold line-clamp-1">{note.title}</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                {note.subject && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {note.subject}
                  </span>
                )}
                {note.university && (
                  <span className="text-xs bg-secondary/10 text-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {note.university}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-3 sm:p-4">
            {note.description && (
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{note.description}</p>
            )}
            <div className="space-y-4">
              {note.preview_image && (
                <img
                  src={note.preview_image}
                  alt={note.title}
                  className="w-full rounded-lg shadow-lg object-contain max-h-[70vh]"
                  loading="lazy"
                />
              )}
              {note.content && (
                <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
                  {note.content}
                </div>
              )}
              {!note.preview_image && !note.content && note.file_url && (
                <div className="flex items-center justify-center bg-muted/30 rounded-lg p-8">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Preview not available. Click download to view the file.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-3 sm:p-4">
            <div className="flex justify-between items-center gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Created {new Date(note.created_at).toLocaleDateString()}
              </div>
              {note.file_url && (
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <a href={note.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Download</span>
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