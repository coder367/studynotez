import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Note Details */}
          <div className="space-y-2">
            {note.description && (
              <p className="text-muted-foreground">{note.description}</p>
            )}
            <div className="flex gap-2">
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

          {/* Uploader Profile */}
          {profile && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{profile.full_name}</h4>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </div>
          )}

          {/* Note Preview */}
          <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
            {note.file_url && (
              <iframe
                src={note.file_url}
                className="w-full h-full"
                title={note.title}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {note.file_url && (
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;