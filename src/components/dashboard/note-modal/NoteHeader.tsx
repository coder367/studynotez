import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  fileUrl,
  onDownload,
  onClose,
}: NoteHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-6 border-b">
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
        <div className="flex gap-2 mt-2">
          {subject && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {subject}
            </span>
          )}
          {university && (
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
              {university}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {fileUrl && (
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};