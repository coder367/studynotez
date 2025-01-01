import { FC } from "react";

interface NoteViewerProps {
  fileUrl?: string;
  title: string;
}

export const NoteViewer: FC<NoteViewerProps> = ({ fileUrl, title }) => {
  return (
    <div className="flex-1 overflow-hidden">
      {fileUrl && (
        <iframe
          src={fileUrl}
          className="w-full h-full"
          title={title}
        />
      )}
    </div>
  );
};