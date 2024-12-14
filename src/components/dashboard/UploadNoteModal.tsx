import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

const UploadNoteModal = ({ isOpen, onClose, file }: UploadNoteModalProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [noteDetails, setNoteDetails] = useState({
    title: "",
    description: "",
    subject: "",
    university: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoteDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('notes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create note record
      const { error: dbError } = await supabase
        .from('notes')
        .insert({
          title: noteDetails.title,
          description: noteDetails.description,
          subject: noteDetails.subject,
          university: noteDetails.university,
          file_url: uploadData?.path,
          file_type: file.type,
          user_id: user.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Note uploaded successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error uploading note:', error);
      toast({
        title: "Error",
        description: "Failed to upload note",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Note Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={noteDetails.title}
              onChange={handleInputChange}
              placeholder="Enter note title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={noteDetails.description}
              onChange={handleInputChange}
              placeholder="Enter note description"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={noteDetails.subject}
              onChange={handleInputChange}
              placeholder="Enter subject"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              name="university"
              value={noteDetails.university}
              onChange={handleInputChange}
              placeholder="Enter university name"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadNoteModal;