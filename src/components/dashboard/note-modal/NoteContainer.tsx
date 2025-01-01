import { FC } from "react";
import { NoteHeader } from "./NoteHeader";
import { NoteViewer } from "./NoteViewer";
import { NoteSidebar } from "./NoteSidebar";

interface NoteContainerProps {
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
  profile: {
    avatar_url?: string;
    full_name: string;
  } | null;
  isLiked: boolean;
  isSaved: boolean;
  showChatButton: boolean;
  isFollowing: boolean;
  onDownload: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onChat: () => void;
  onFollow: () => void;
  onClose: () => void;
}

export const NoteContainer: FC<NoteContainerProps> = ({
  note,
  profile,
  isLiked,
  isSaved,
  showChatButton,
  isFollowing,
  onDownload,
  onLike,
  onSave,
  onShare,
  onChat,
  onFollow,
  onClose,
}) => {
  return (
    <div className="flex-1 min-h-0 flex">
      <div className="flex-1 overflow-auto">
        <NoteHeader
          title={note.title}
          description={note.description}
          subject={note.subject}
          university={note.university}
          fileUrl={note.file_url}
          onDownload={onDownload}
          onClose={onClose}
        />
        <NoteViewer fileUrl={note.file_url} title={note.title} />
      </div>
      
      <NoteSidebar
        profile={profile}
        noteUserId={note.user_id}
        createdAt={note.created_at}
        isLiked={isLiked}
        isSaved={isSaved}
        showChatButton={showChatButton}
        isFollowing={isFollowing}
        onLike={onLike}
        onSave={onSave}
        onShare={onShare}
        onChat={onChat}
        onFollow={onFollow}
      />
    </div>
  );
};