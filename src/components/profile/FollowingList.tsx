import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FollowingListProps {
  userId: string;
  currentUserId?: string;
  onProfileClick: (id: string) => void;
}

export const FollowingList = ({ userId, currentUserId, onProfileClick }: FollowingListProps) => {
  const { data: following = [] } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      // Only fetch if viewing own profile
      if (userId !== currentUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from("followers")
        .select(`
          id,
          following:following_id (
            id,
            full_name
          )
        `)
        .eq("follower_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!currentUserId,
  });

  // If not viewing own profile, don't show anything
  if (userId !== currentUserId) {
    return null;
  }

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