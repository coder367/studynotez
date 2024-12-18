import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ViewNoteModal from "@/components/dashboard/ViewNoteModal";
import { useState } from "react";

interface UserProfileProps {
  userId: string;
  currentUserId?: string;
}

export const UserProfile = ({ userId, currentUserId }: UserProfileProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<any>(null);

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

  const { data: userNotes } = useQuery({
    queryKey: ["userNotes", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data || [];
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

  // Ensure followers is an array and check if currentUser is following
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
              <span>{followers?.length || 0} followers</span>
              <span>{following?.length || 0} following</span>
            </div>
            {profile?.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
          </div>
        </div>
        {currentUserId && currentUserId !== userId && (
          <div className="flex gap-2">
            <Button onClick={handleFollow} variant="outline">
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
            <Button onClick={handleChat}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Followers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(followers) && followers.map((follow) => (
            <Card key={follow.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {follow.follower?.full_name?.[0] || "?"}
                </div>
                <span>{follow.follower?.full_name || "Anonymous"}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userNotes?.map((note) => (
            <Card
              key={note.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedNote(note)}
            >
              <h4 className="font-medium">{note.title}</h4>
              {note.subject && (
                <p className="text-sm text-muted-foreground mt-1">
                  {note.subject} - {note.university || "Unknown University"}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedNote && (
        <ViewNoteModal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          note={selectedNote}
        />
      )}
    </div>
  );
};