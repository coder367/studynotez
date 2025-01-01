import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NoteHeaderProps {
  title: string;
  description?: string;
  subject?: string;
  university?: string;
  fileUrl?: string;
  onDownload: () => void;
  onClose: () => void;
}

export const NoteHeader = ({
  title,
  description,
  subject,
  university,
  onDownload,
  onClose,
}: NoteHeaderProps) => {
  return (
    <div className="p-6 border-b">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
          <div className="flex gap-2 mt-2">
            {subject && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                {subject}
              </span>
            )}
            {university && (
              <span className="text-sm bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                {university}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDownload}>
            Download
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};