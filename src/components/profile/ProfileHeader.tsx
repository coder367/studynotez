import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserMinus } from "lucide-react";

interface ProfileHeaderProps {
  profile: any;
  followersCount: number;
  followingCount: number;
  currentUserId?: string;
  userId: string;
  isFollowing: boolean;
  onFollow: () => void;
  onChat: () => void;
}

export const ProfileHeader = ({
  profile,
  followersCount,
  followingCount,
  currentUserId,
  userId,
  isFollowing,
  onFollow,
  onChat,
}: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {profile?.full_name?.charAt(0) || "?"}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile?.full_name || "Anonymous"}</h2>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{followingCount} following</span>
          </div>
          {profile?.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
        </div>
      </div>
      {currentUserId && currentUserId !== userId && (
        <div className="flex gap-2">
          <Button onClick={onFollow} variant="outline">
            {isFollowing ? (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Follow
              </>
            )}
          </Button>
          <Button onClick={onChat}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      )}
    </div>
  );
};