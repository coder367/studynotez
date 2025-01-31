import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

const UploadNoteModal = ({ isOpen, onClose, file }: UploadNoteModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [noteDetails, setNoteDetails] = useState({
    title: "",
    description: "",
    subject: "",
    university: "",
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload notes",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoteDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    if (!noteDetails.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get authenticated user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        throw new Error("Authentication required");
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(fileName);

      // Create note record
      const { error: dbError } = await supabase
        .from('notes')
        .insert({
          title: noteDetails.title,
          description: noteDetails.description,
          subject: noteDetails.subject,
          university: noteDetails.university,
          file_url: publicUrl,
          file_type: file.type,
          user_id: session.user.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Note uploaded successfully",
      });
      onClose();
    } catch (error: any) {
      console.error('Error uploading note:', error);
      
      if (error.message === "Authentication required") {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload notes",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to upload note. Please try again.",
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
              required
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