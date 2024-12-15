import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Paperclip, Send } from "lucide-react";

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  isUploading: boolean;
}

export const ChatInput = ({
  message,
  onMessageChange,
  onSend,
  onFileSelect,
  selectedFile,
  isUploading
}: ChatInputProps) => {
  return (
    <div className="border-t p-4">
      <form onSubmit={onSend} className="flex gap-2">
        <Input
          type="file"
          onChange={onFileSelect}
          className="hidden"
          id="file-upload"
          accept="image/*,.pdf,.doc,.docx"
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
          Selected file: {selectedFile.name}
        </div>
      )}
    </div>
  );
};