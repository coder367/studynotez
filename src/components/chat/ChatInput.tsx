import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Paperclip, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  isUploading: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const ChatInput = ({
  message,
  onMessageChange,
  onSend,
  onFileSelect,
  selectedFile,
  isUploading,
  inputRef
}: ChatInputProps) => {
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload images smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      onFileSelect(e);
    }
  };

  return (
    <div className="border-t p-4">
      <form onSubmit={onSend} className="flex gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          accept="image/*"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isUploading}
        />
        <Button type="submit" size="icon" disabled={isUploading}>
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      {selectedFile && (
        <div className="mt-2 text-sm text-muted-foreground">
          Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
        </div>
      )}
    </div>
  );
};