import { Card } from "@/components/ui/card";

interface FollowingListProps {
  following: any[];
  onProfileClick: (id: string) => void;
}

export const FollowingList = ({ following, onProfileClick }: FollowingListProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.isArray(following) && following.map((follow) => (
        <Card 
          key={follow.id} 
          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onProfileClick(follow.following.id)}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {follow.following?.full_name?.[0] || "?"}
            </div>
            <span>{follow.following?.full_name || "Anonymous"}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};