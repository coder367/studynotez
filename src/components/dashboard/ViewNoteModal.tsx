import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { data: profile } = useQuery({
    queryKey: ["profile", note.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", note.user_id)
        .single();
      return data;
    },
  });

  const handleDownload = async () => {
    if (note.file_url) {
      const response = await fetch(note.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.${note.file_type?.split('/').pop()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{note.title}</h2>
            {note.description && (
              <p className="text-muted-foreground mt-1">{note.description}</p>
            )}
            <div className="flex gap-2 mt-2">
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
          <div className="flex items-center gap-4">
            {note.file_url && (
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 overflow-hidden">
            {note.file_url && (
              <iframe
                src={note.file_url}
                className="w-full h-full"
                title={note.title}
              />
            )}
          </div>
          {profile && (
            <div className="w-64 border-l p-4 bg-muted/50">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{profile.full_name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-4">{profile.bio}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;