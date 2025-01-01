import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, UserPlus, UserMinus } from "lucide-react";

interface UserProfileSectionProps {
  userId: string;
  currentUser: { id: string } | null;
  createdAt: string;
}

export const UserProfileSection = ({ userId, currentUser, createdAt }: UserProfileSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Query to get the note author's profile
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Query to check if following
  const { data: followers = [], refetch: refetchFollowers } = useQuery({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId);
      return data || [];
    },
    enabled: !!currentUser && currentUser.id !== userId,
  });

  const isFollowing = followers.length > 0;

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);
      } else {
        await supabase
          .from("followers")
          .insert({
            follower_id: currentUser.id,
            following_id: userId,
          });
      }
      refetchFollowers();
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You unfollowed this user" : "You are now following this user",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleChat = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to message users",
        variant: "destructive",
      });
      return;
    }
    navigate(`/dashboard/chat?user=${userId}`);
  };

  return (
    <div className="space-y-4 p-4 border-t">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <span className="text-lg">{profile?.full_name?.[0]}</span>
          )}
        </div>
        <div>
          <h3 className="font-medium">{profile?.full_name || "Anonymous"}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {currentUser && currentUser.id !== userId && (
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={handleFollow} className="w-full">
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
          <Button variant="outline" onClick={handleChat} className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      )}
    </div>
  );
};