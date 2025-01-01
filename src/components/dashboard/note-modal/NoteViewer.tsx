import { FC } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NoteViewerProps {
  fileUrl?: string;
  title: string;
}

export const NoteViewer: FC<NoteViewerProps> = ({ fileUrl, title }) => {
  const isMobile = useIsMobile();

  return (
    <div className="h-full w-full overflow-hidden">
      {fileUrl && (
        <iframe
          src={fileUrl}
          className="w-full h-full"
          title={title}
          style={{
            minHeight: isMobile ? '100%' : '600px',
            border: 'none',
          }}
        />
      )}
    </div>
  );
};