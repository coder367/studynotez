import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NoteHeader } from "./note-modal/NoteHeader";
import { NoteViewer } from "./note-modal/NoteViewer";
import { NoteSidebar } from "./note-modal/NoteSidebar";
import { UserProfileSection } from "./note-modal/UserProfileSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    university?: string;
    file_url?: string;
    file_type?: string;
    user_id: string;
    created_at: string;
  };
}

const ViewNoteModal = ({ isOpen, onClose, note }: ViewNoteModalProps) => {
  const isMobile = useIsMobile();
  
  // Query to get current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handleDownload = () => {
    if (note.file_url) {
      window.open(note.file_url, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogTitle className="sr-only">{note.title}</DialogTitle>
        
        <NoteHeader
          title={note.title}
          description={note.description}
          subject={note.subject}
          university={note.university}
          fileUrl={note.file_url}
          onClose={onClose}
          onDownload={handleDownload}
        />

        <div className="flex-1 min-h-0 flex">
          <div className={isMobile ? 'w-full' : 'flex-1'}>
            <NoteViewer fileUrl={note.file_url} title={note.title} />
          </div>
          
          {!isMobile && (
            <div className="w-64 border-l flex flex-col">
              <UserProfileSection 
                userId={note.user_id}
                currentUser={currentUser}
                createdAt={note.created_at}
              />
              <NoteSidebar
                noteId={note.id}
                currentUser={currentUser}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;