import { Button } from "@/components/ui/button";
import { Heart, Share2, Bookmark, MessageSquare } from "lucide-react";

interface NoteActionsProps {
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

export const NoteActions = ({
  isLiked,
  isSaved,
  showChatButton,
  isFollowing,
  onLike,
  onSave,
  onShare,
  onChat,
  onFollow,
}: NoteActionsProps) => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {showChatButton && (
        <>
          <Button
            variant="outline"
            className="w-full"
            onClick={onFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onChat}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onLike}
          className={isLiked ? "text-red-500" : ""}
        >
          <Heart className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onSave}
          className={isSaved ? "text-yellow-500" : ""}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};