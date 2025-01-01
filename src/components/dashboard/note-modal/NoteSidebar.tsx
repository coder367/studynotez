import { FC } from "react";
import { UserInfo } from "./UserInfo";
import { NoteActions } from "./NoteActions";

interface NoteSidebarProps {
  profile: {
    avatar_url?: string;
    full_name: string;
  } | null;
  noteUserId: string;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
  showChatButton: boolean;
  isFollowing: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onChat: () => void;
  onFollow: () => void;
}

export const NoteSidebar: FC<NoteSidebarProps> = ({
  profile,
  noteUserId,
  createdAt,
  isLiked,
  isSaved,
  showChatButton,
  isFollowing,
  onLike,
  onSave,
  onShare,
  onChat,
  onFollow,
}) => {
  if (!profile) return null;

  return (
    <div className="w-64 border-l p-4">
      <UserInfo
        avatarUrl={profile.avatar_url}
        fullName={profile.full_name}
        createdAt={createdAt}
        userId={noteUserId}
      />
      <NoteActions
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