import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "./ProfileHeader";
import { FollowingList } from "./FollowingList";
import { UserNotes } from "./UserNotes";

interface UserProfileProps {
  userId: string;
  currentUserId?: string;
}

export const UserProfile = ({ userId, currentUserId }: UserProfileProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    },
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("followers")
        .select(`
          *,
          follower:profiles!followers_follower_id_fkey (
            id,
            full_name
          )
        `)
        .eq("following_id", userId);
      return data || [];
    },
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("followers")
        .select(`
          *,
          following:profiles!followers_following_id_fkey (
            id,
            full_name
          )
        `)
        .eq("follower_id", userId);
      return data || [];
    },
  });

  const isFollowing = Array.isArray(followers) && followers.some(f => f.follower_id === currentUserId);

  const handleFollow = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("followers")
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });

        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleChat = () => {
    navigate(`/dashboard/chat?user=${userId}`);
  };

  return (
    <div className="space-y-6">
      <ProfileHeader 
        profile={profile}
        followersCount={followers?.length || 0}
        followingCount={following?.length || 0}
        currentUserId={currentUserId}
        userId={userId}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onChat={handleChat}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <UserNotes userId={userId} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Following</h3>
          <div className="bg-card rounded-lg p-4">
            <FollowingList 
              userId={userId}
              currentUserId={currentUserId}
              onProfileClick={(id) => navigate(`/dashboard/profile/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};